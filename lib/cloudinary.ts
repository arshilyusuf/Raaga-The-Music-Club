/**
 * Transforms a Cloudinary URL to add optimization parameters.
 * Works with both /upload/ and /image/upload/ URL patterns.
 *
 * @param url      - Original Cloudinary URL
 * @param options  - Transformation options
 */
export function getCloudinaryUrl(
  url: string,
  options: {
    width?: number;
    quality?: number | "auto";
    format?: "auto" | "webp" | "avif";
    blur?: number; // 1–2000, for placeholder generation
  } = {},
): string {
  if (!url || !url.includes("cloudinary.com")) return url;

  const { width, quality = "auto", format = "auto", blur } = options;

  const transforms: string[] = [];
  if (width) transforms.push(`w_${width}`);
  if (quality) transforms.push(`q_${quality}`);
  if (format) transforms.push(`f_${format}`);
  if (blur) transforms.push(`e_blur:${blur}`);

  // c_limit keeps aspect ratio, never upscales
  if (width) transforms.push("c_limit");

  const transformString = transforms.join(",");

  // Insert transforms right after /upload/ or /image/upload/
  return url.replace(
    /\/(image\/)?upload\//,
    `/image/upload/${transformString}/`,
  );
}

/**
 * Returns a tiny blurred placeholder URL (~200px wide, heavily blurred).
 * Keep this tiny — it loads inline before the real image.
 */
export function getPlaceholderUrl(url: string): string {
  return getCloudinaryUrl(url, { width: 30, quality: 20, blur: 800 });
}

/**
 * Returns a display-quality URL (width-capped, auto quality + format).
 */
export function getOptimizedUrl(url: string, maxWidth = 800): string {
  return getCloudinaryUrl(url, {
    width: maxWidth,
    quality: "auto",
    format: "auto",
  });
}
