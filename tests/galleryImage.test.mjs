import assert from 'node:assert/strict';
import sharp from 'sharp';
import test from 'node:test';
import {
  GalleryImageError, MAX_GALLERY_IMAGE_BYTES, optimizeGalleryImage
} from '../src/lib/galleryImage.ts';

async function image(format = 'png', width = 32, height = 24) {
  const pipeline = sharp({
    create: { width, height, channels: 3, background: { r: 30, g: 90, b: 140 } }
  });
  return format === 'jpeg' ? pipeline.jpeg().toBuffer()
    : format === 'webp' ? pipeline.webp().toBuffer()
      : pipeline.png().toBuffer();
}

test('JPEG, PNG and WebP signatures are decoded and emitted as metadata-free WebP variants', async () => {
  for (const [format, type] of [['jpeg', 'image/jpeg'], ['png', 'image/png'], ['webp', 'image/webp']]) {
    const optimized = await optimizeGalleryImage(await image(format), type);
    assert.equal(optimized.inputFormat, format);
    assert.equal(optimized.width, 32);
    assert.equal(optimized.height, 24);
    assert.equal((await sharp(optimized.display).metadata()).format, 'webp');
    assert.equal((await sharp(optimized.thumbnail).metadata()).format, 'webp');
    assert.equal((await sharp(optimized.display).metadata()).exif, undefined);
  }
});

test('upload validation rejects MIME spoofing, unsupported bytes, truncated images and oversized files', async () => {
  const png = await image('png');
  await assert.rejects(optimizeGalleryImage(png, 'image/jpeg'), GalleryImageError);
  await assert.rejects(optimizeGalleryImage(Buffer.from('not an image at all'), 'image/png'), GalleryImageError);
  await assert.rejects(optimizeGalleryImage(png.subarray(0, 20), 'image/png'), GalleryImageError);
  await assert.rejects(optimizeGalleryImage(Buffer.alloc(MAX_GALLERY_IMAGE_BYTES + 1), 'image/png'), GalleryImageError);
});

test('upload validation rejects excessive decoded dimensions before image transformation', async () => {
  const tall = await image('png', 10_001, 1);
  assert.ok(tall.byteLength < MAX_GALLERY_IMAGE_BYTES);
  await assert.rejects(optimizeGalleryImage(tall, 'image/png'), GalleryImageError);
});
