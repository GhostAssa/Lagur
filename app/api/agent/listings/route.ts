import { requireApiUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { propertyInput } from "@/lib/validators/property";
import { DOCUMENT_TYPES, IMAGE_TYPES, MAX_DOCUMENT_BYTES, MAX_IMAGE_BYTES, safeFileName, validFile } from "@/lib/security/files";
import { rateLimit } from "@/lib/security/rate-limit";

async function hasExpectedSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (file.type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (file.type === "image/webp") return String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP";
  if (file.type === "application/pdf") return String.fromCharCode(...bytes.slice(0,4)) === "%PDF";
  return false;
}

export async function POST(request: Request) {
  const auth = await requireApiUser(["agent", "company"]);
  if (!auth.user) return auth.response;
  const quota = rateLimit(`listing:${auth.user.id}`, 12, 60_000);
  if (!quota.allowed) return Response.json({ error: "Please wait before submitting another listing." }, { status: 429 });
  const form = await request.formData();
  const parsed = propertyInput.safeParse({ ...Object.fromEntries(form), bedrooms: form.get("bedrooms") || undefined, plots: form.get("plots") || undefined, land_size_sqm: form.get("land_size_sqm") || undefined, survey_plan_number: form.get("survey_plan_number") || undefined });
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Check the listing details." }, { status: 400 });
  const photos = form.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
  const cofo = form.get("document_cofo");
  const survey = form.get("document_survey");
  const other = form.getAll("document_other").filter((item): item is File => item instanceof File && item.size > 0);
  if (!photos.length || photos.length > 12) return Response.json({ error: "Add 1 to 12 property photos." }, { status: 400 });
  if (!(cofo instanceof File) || !(survey instanceof File) || !other.length) return Response.json({ error: "Upload a Certificate of Occupancy, survey plan and at least one supporting document." }, { status: 400 });
  for (const photo of photos) if (!validFile(photo, IMAGE_TYPES, MAX_IMAGE_BYTES) || !(await hasExpectedSignature(photo))) return Response.json({ error: "Photos must be valid JPG, PNG or WebP files under 8 MB." }, { status: 400 });
  for (const file of [cofo, survey, ...other]) if (!validFile(file, DOCUMENT_TYPES, MAX_DOCUMENT_BYTES) || !(await hasExpectedSignature(file))) return Response.json({ error: "Documents must be valid PDF, JPG or PNG files under 12 MB." }, { status: 400 });

  const supabase = await createClient();
  if (!supabase) return Response.json({ error: "Listing storage is not configured." }, { status: 503 });
  const { data: agency } = await supabase.from("agencies").select("id,status").eq("owner_id", auth.user.id).single();
  if (!agency) return Response.json({ error: "Finish setting up your agency profile first." }, { status: 403 });
  const { data: property, error: createError } = await supabase.from("properties").insert({
    agency_id: agency.id, category: parsed.data.category, type: parsed.data.type, title: parsed.data.title, description: parsed.data.description,
    state: parsed.data.state, lga: parsed.data.lga, city: parsed.data.city, address: parsed.data.address,
    price_kobo: parsed.data.price_naira * 100, bedrooms: parsed.data.bedrooms ?? null, plots: parsed.data.plots ?? null,
    land_size_sqm: parsed.data.land_size_sqm ?? null, latitude: parsed.data.latitude ?? null, longitude: parsed.data.longitude ?? null, zone_id: parsed.data.zone_id, status: "draft",
  }).select("id").single();
  if (createError || !property) return Response.json({ error: "We could not create the listing. Check your details and try again." }, { status: 400 });
  const uploadedPaths: string[] = [];
  try {
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i]; const path = `${agency.id}/${property.id}/${String(i).padStart(2,"0")}-${safeFileName(file.name)}`;
      const { error } = await supabase.storage.from("listing-photos").upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      uploadedPaths.push(path);
      const { data: publicUrl } = supabase.storage.from("listing-photos").getPublicUrl(path);
      const media = await supabase.from("property_media").insert({ property_id: property.id, url: publicUrl.publicUrl, position: i, alt: `${parsed.data.type.replaceAll("_"," ")} property in ${parsed.data.city}, ${parsed.data.state}` });
      if (media.error) throw media.error;
    }
    const docs = [{ kind: "cofo", file: cofo }, { kind: "survey", file: survey }, ...other.map((file) => ({ kind: "other", file }))];
    const documentRows = [];
    for (const [i, doc] of docs.entries()) {
      const path = `${agency.id}/${property.id}/${doc.kind}-${i}-${safeFileName(doc.file.name)}`;
      const { error } = await supabase.storage.from("listing-documents").upload(path, doc.file, { contentType: doc.file.type, upsert: false });
      if (error) throw error;
      uploadedPaths.push(path);
      documentRows.push({ property_id: property.id, kind: doc.kind, storage_path: path });
    }
    const inserted = await supabase.from("documents").insert(documentRows);
    if (inserted.error) throw inserted.error;
    const surveyNumber = parsed.data.survey_plan_number?.toUpperCase().replace(/[^A-Z0-9]/g, "") ?? null;
    let duplicateFlag = false;
    if (surveyNumber) {
      const { data: duplicate, error: parcelError } = await supabase.rpc("register_property_parcel", { p_property_id: property.id, p_survey: surveyNumber, p_state: parsed.data.state, p_lga: parsed.data.lga });
      if (parcelError) throw parcelError;
      duplicateFlag = duplicate?.duplicate === true;
    }
    const submitted = await supabase.from("properties").update({ status: "pending_review", duplicate_flag: duplicateFlag }).eq("id", property.id);
    if (submitted.error) throw submitted.error;
    return Response.json({ id: property.id, status: "pending_review", duplicate_flag: duplicateFlag }, { status: 201 });
  } catch {
    await supabase.storage.from("listing-photos").remove(uploadedPaths);
    await supabase.storage.from("listing-documents").remove(uploadedPaths);
    await supabase.from("properties").delete().eq("id", property.id);
    return Response.json({ error: "Some files could not be saved. Check the file types and try again." }, { status: 400 });
  }
}
