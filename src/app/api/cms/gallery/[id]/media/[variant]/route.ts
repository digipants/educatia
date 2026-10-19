import { withCmsAccess } from '@/lib/cmsStore';
import { isCmsId } from '@/lib/cmsContent';
import { getCmsGalleryConfiguration } from '@/lib/cmsGallerySecurity';
import { getAdminGalleryPhotoKeys, getPublishedGalleryPhotoKeys } from '@/lib/cmsGalleryStore';
import { getGalleryObjectStore } from '@/lib/galleryBlobStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const privateImageHeaders = {
  'Content-Type': 'image/webp',
  'Content-Disposition': 'inline; filename="gallery-image.webp"',
  'Cache-Control': 'private, no-store, max-age=0',
  'Netlify-CDN-Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; sandbox"
};

export async function GET(_request: Request, context: {
  params: Promise<{ id: string; variant: string }>;
}) {
  const { id, variant: rawVariant } = await context.params;
  if (!isCmsId(id) || (rawVariant !== 'display' && rawVariant !== 'thumbnail')) {
    return new Response(null, { status: 404, headers: privateImageHeaders });
  }
  if (!getCmsGalleryConfiguration(process.env).enabled) {
    return new Response(null, { status: 404, headers: privateImageHeaders });
  }

  let key: string | null = null;
  try { key = await getPublishedGalleryPhotoKeys(id, rawVariant); }
  catch { return new Response(null, { status: 404, headers: privateImageHeaders }); }
  if (!key) {
    const privateResult = await withCmsAccess('editor', async () => getAdminGalleryPhotoKeys(id, rawVariant));
    if (privateResult.status === 'ok') key = privateResult.value;
  }
  if (!key) return new Response(null, { status: 404, headers: privateImageHeaders });

  try {
    const image = await getGalleryObjectStore().get(key);
    if (!image) return new Response(null, { status: 404, headers: privateImageHeaders });
    return new Response(image, { status: 200, headers: privateImageHeaders });
  } catch {
    return new Response(null, { status: 404, headers: privateImageHeaders });
  }
}
