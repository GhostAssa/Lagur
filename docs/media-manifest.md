# Owner media manifest

Inventory source: `public/media/` (files are kept in their original locations and names). Dimensions, codecs and video durations were read with `ffprobe`; file sizes are the originals on disk.

## Inventory and assignment

| Original file | Type / format | Dimensions | Duration | Original size | Assignment and reason |
|---|---|---:|---:|---:|---|
| `videos/1143632899154572235.jpg` | JPEG image | 736 × 414 | — | 59.1 KiB | Unassigned. The name is numeric; despite showing a garden and houses, it has no filename clue for a requested section. |
| `videos/627478160587280620.jpg` | JPEG image | 736 × 981 | — | 146.0 KiB | Unassigned. The name is numeric; despite showing undeveloped ground, it has no filename clue for the land section. |
| `videos/ano meme.jpg` | JPEG image | 633 × 438 | — | 31.8 KiB | Meme card 2, “When the house you wanted is already taken”; the filename contains “meme”. |
| `videos/double meme.jpg` | JPEG image | 720 × 462 | — | 43.0 KiB | Meme card 4, “When the land you paid for belongs to someone else”; the filename contains “meme”. |
| `videos/house 2.mp4` | MP4 / H.264 | 1920 × 1080 | 17.32 s | 22.96 MiB | Hero house montage. The filename names a house and the footage shows a residential neighborhood. |
| `videos/houses.mp4` | MP4 / H.264 | 1920 × 1080 | 31.15 s | 59.19 MiB | Outro video. The filename names houses and the footage shows a residential estate. |
| `videos/Lagos Building, Surulere.jpg` | JPEG image | 736 × 981 | — | 121.8 KiB | Featured Surulere card. Both the filename and image identify a building in Surulere. |
| `videos/lagos.mp4` | MP4 / H.264 | 3840 × 2160 | 11.08 s | 100.26 MiB | Featured Lagos card. “Lagos” is explicit in the filename and the footage shows the city. |
| `videos/new.mp4` | MP4 / H.264 + AAC | 1920 × 1080 | 20.13 s | 14.52 MiB | Featured slider card “Aerial view.” The clip shows a residential city from above, but no location is identifiable, so the copy does not assign it to a Nigerian city. |
| `videos/look meme.jpg` | JPEG image | 735 × 589 | — | 34.2 KiB | Meme card 3, “When the agent quotes a ridiculous fee”; the filename contains “meme”. |
| `videos/Nigerian tourist’s spots, Obudu Mountain Resort….jpg` | JPEG image | 400 × 300 | — | 26.8 KiB | Unassigned. The filename identifies a tourist resort, not a house-hunting section. |
| `videos/stress meme.jpg` | JPEG image | 729 × 588 | — | 42.0 KiB | Meme card 1, “After weeks of house hunting”; the filename contains “meme”. |
| `videos/VictoriaCrestHomes on Instagram_ _The beauty we….jpg` | JPEG image | 613 × 461 | — | 63.6 KiB | Buyer audience image and featured homes card. The filename names a homes account and the photo shows a residential estate. |

“Unassigned” files remain unchanged and are not used on the page. No Abuja, rental-specific or land-named media was present, so the renter and agent audience illustrations remain as they are; I did not infer those categories from ambiguous filenames.

## Optimized outputs

Originals remain untouched. Generated page assets live under `public/media-optimized/videos/` and keep each original base name followed by a width or video-size suffix.

| Original | Generated outputs | Use |
|---|---|---|
| `house 2.mp4` | `house 2-720p.mp4`, `house 2-720p.webm`, `house 2-1080p.mp4`, `house 2-1080p.webm`, `house 2-poster.webp` | Hero, mobile and desktop sources |
| `houses.mp4` | `houses-720p.mp4`, `houses-720p.webm`, `houses-poster.webp` | Outro background |
| `lagos.mp4` | `lagos-720p.mp4`, `lagos-720p.webm`, `lagos-poster.webp` | Featured Lagos card |
| `new.mp4` | `new-720p.mp4`, `new-720p.webm`, `new-poster.webp` | Featured slider, generic neighborhood footage; muted 8-second 720p loop |
| `Lagos Building, Surulere.jpg` | `Lagos Building, Surulere-480w.webp`, `Lagos Building, Surulere-736w.webp` | Featured Surulere card |
| `VictoriaCrestHomes on Instagram_ _The beauty we….jpg` | `VictoriaCrestHomes on Instagram_ _The beauty we…-480w.webp`, `…-613w.webp` | Buyers and featured homes card |
| Four `*meme.jpg` files | One WebP each at original width (all below 900px) | Meme carousel, `object-fit: contain`; no crop |

## Rights review

The four meme images visibly contain people’s faces and appear to be stills. A code TODO flags them for owner review of identity, source and public-use rights before launch.
