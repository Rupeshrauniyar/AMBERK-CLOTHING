/**
 * Responsive image helpers. Supports Unsplash and Cloudinary transformations;
 * other URLs are returned untouched.
 */
export function imgUrl(src, width = 800) {
  if (!src) return '';
  try {
    if (src.includes('images.unsplash.com')) {
      const u = new URL(src);
      u.searchParams.set('w', String(width));
      u.searchParams.set('q', '75');
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      return u.toString();
    }
    if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
      return src.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
    }
  } catch {
    /* fall through */
  }
  return src;
}

export function srcSet(src, widths = [400, 640, 900, 1200, 1600]) {
  if (!src || !(src.includes('images.unsplash.com') || src.includes('res.cloudinary.com'))) return undefined;
  return widths.map((w) => `${imgUrl(src, w)} ${w}w`).join(', ');
}

