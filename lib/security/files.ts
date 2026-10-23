export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 12 * 1024 * 1024;
export const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const DOCUMENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

export function safeFileName(name: string) {
  return name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "upload";
}

export function validFile(file: File, types: Set<string>, maxBytes: number) {
  return types.has(file.type) && file.size > 0 && file.size <= maxBytes;
}
