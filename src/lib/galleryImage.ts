import sharp from 'sharp';

export const MAX_GALLERY_IMAGE_BYTES = 3 * 1024 * 1024;
export const MAX_GALLERY_REQUEST_BYTES = MAX_GALLERY_IMAGE_BYTES + 24 * 1024;
export const MAX_GALLERY_IMAGE_PIXELS = 25_000_000;
const MAX_GALLERY_IMAGE_DIMENSION = 10_000;

export class GalleryImageError extends Error {}

export type OptimizedGalleryImage = {
  display: Buffer;
  thumbnail: Buffer;
  inputFormat: 'jpeg' | 'png' | 'webp';
  width: number;
  height: number;
};

function sniffImageFormat(bytes: Uint8Array): 'jpeg' | 'png' | 'webp' | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e &&
      bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
    return 'png';
  }
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 &&
      bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'webp';
  }
  return null;
}

const contentTypes = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp'
} as const;

export async function optimizeGalleryImage(
  source: Uint8Array,
  claimedContentType: string
): Promise<OptimizedGalleryImage> {
  if (!(source instanceof Uint8Array) || source.byteLength < 12 || source.byteLength > MAX_GALLERY_IMAGE_BYTES) {
    throw new GalleryImageError('Invalid image size');
  }
  const inputFormat = sniffImageFormat(source);
  if (!inputFormat || contentTypes[inputFormat] !== claimedContentType) {
    throw new GalleryImageError('Unsupported image content');
  }

  const input = Buffer.from(source.buffer, source.byteOffset, source.byteLength);
  const decoder = sharp(input, {
    failOn: 'error',
    limitInputPixels: MAX_GALLERY_IMAGE_PIXELS,
    sequentialRead: true
  });
  const metadata = await decoder.metadata().catch(() => {
    throw new GalleryImageError('Invalid image content');
  });
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  if (metadata.format !== inputFormat || (metadata.pages ?? 1) !== 1 || width < 1 || height < 1 ||
      width > MAX_GALLERY_IMAGE_DIMENSION || height > MAX_GALLERY_IMAGE_DIMENSION ||
      width * height > MAX_GALLERY_IMAGE_PIXELS) {
    throw new GalleryImageError('Unsupported image dimensions');
  }

  const display = await decoder.clone().rotate().resize({
    width: 1600,
    height: 1600,
    fit: 'inside',
    withoutEnlargement: true
  }).webp({ quality: 82, effort: 4 }).toBuffer().catch(() => {
    throw new GalleryImageError('Invalid image content');
  });
  const thumbnail = await decoder.clone().rotate().resize({
    width: 640,
    height: 640,
    fit: 'inside',
    withoutEnlargement: true
  }).webp({ quality: 76, effort: 4 }).toBuffer().catch(() => {
    throw new GalleryImageError('Invalid image content');
  });
  if (display.byteLength > MAX_GALLERY_IMAGE_BYTES || thumbnail.byteLength > MAX_GALLERY_IMAGE_BYTES) {
    throw new GalleryImageError('Optimized image is too large');
  }

  return { display, thumbnail, inputFormat, width, height };
}
