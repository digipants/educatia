import { withCmsAccess } from '@/lib/cmsStore';
import { isCmsId } from '@/lib/cmsContent';
import { getCmsGalleryConfiguration } from '@/lib/cmsGallerySecurity';
import { beginCmsGalleryUpload, clearCmsGalleryCleanupKeys, completeCmsGalleryUpload } from '@/lib/cmsGalleryStore';
import { isSameOriginMutation } from '@/lib/cmsRequestSecurity';
import { MultipartBodyError, readBoundedMultipartBytes } from '@/lib/boundedMultipartBody';
import { GalleryImageError, MAX_GALLERY_IMAGE_BYTES, MAX_GALLERY_REQUEST_BYTES, optimizeGalleryImage } from '@/lib/galleryImage';
import { getGalleryObjectStore } from '@/lib/galleryBlobStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const jsonHeaders = {
  'Cache-Control': 'no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer'
};

function response(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: jsonHeaders });
}

function validSingleFile(form: FormData) {
  const keys = Array.from(form.keys());
  if (keys.length !== 3 || new Set(keys).size !== 3 ||
      !['postId', 'expectedRevision', 'file'].every(key => form.getAll(key).length === 1)) return null;
  const postId = form.get('postId');
  const expectedRevision = form.get('expectedRevision');
  const file = form.get('file');
  if (typeof postId !== 'string' || typeof expectedRevision !== 'string' ||
      !(file instanceof File) || file.size < 1 || file.size > MAX_GALLERY_IMAGE_BYTES) return null;
  return { postId, expectedRevision, file };
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const config = getCmsGalleryConfiguration(process.env);
  if (!config.enabled) return response(503, { error: 'Gallery uploads are unavailable.' });
  if (!isSameOriginMutation(request)) return response(403, { error: 'Request denied.' });

  const contentType = request.headers.get('content-type') ?? '';
  if (!/^multipart\/form-data\s*;\s*boundary=/i.test(contentType)) {
    return response(415, { error: 'Multipart form data required.' });
  }
  let form: FormData;
  try {
    const bytes = await readBoundedMultipartBytes(request, MAX_GALLERY_REQUEST_BYTES);
    form = await new Response(bytes, { headers: { 'content-type': contentType } }).formData();
  } catch (error) {
    const status = error instanceof MultipartBodyError ? error.status : 400;
    return response(status, { error: 'Invalid upload request.' });
  }

  const upload = validSingleFile(form);
  const { id } = await context.params;
  if (!upload || upload.postId !== id || !isCmsId(id) || !isCmsId(upload.expectedRevision)) {
    return response(400, { error: 'Invalid upload request.' });
  }
  const source = new Uint8Array(await upload.file.arrayBuffer());
  if (source.byteLength !== upload.file.size) return response(400, { error: 'Invalid upload request.' });

  const result = await withCmsAccess('editor', async () => {
    let optimized;
    try { optimized = await optimizeGalleryImage(source, upload.file.type); }
    catch (error) {
      if (error instanceof GalleryImageError) return { kind: 'invalid' as const };
      return { kind: 'invalid' as const };
    }

    let store;
    try { store = getGalleryObjectStore(); }
    catch {
      console.warn('educatia_gallery_storage_failure');
      return { kind: 'storage-failure' as const };
    }
    const prepared = await beginCmsGalleryUpload(id, upload.expectedRevision);
    if (prepared === 'retry-later') return { kind: 'retry-later' as const };
    if (!prepared) return { kind: 'stale' as const };
    try {
      await store.put(prepared.displayKey, optimized.display);
      await store.put(prepared.thumbnailKey, optimized.thumbnail);
    } catch {
      console.warn('educatia_gallery_storage_failure');
      return { kind: 'storage-failure' as const };
    }

    const completed = await completeCmsGalleryUpload(id, prepared.revision, prepared.token);
    if (!completed) return { kind: 'stale' as const };
    if (completed.cleanupKeys.length) {
      const store = getGalleryObjectStore();
      const removed: string[] = [];
      for (const key of completed.cleanupKeys) {
        if (key === prepared.displayKey || key === prepared.thumbnailKey) continue;
        try { await store.delete(key); removed.push(key); } catch { /* Retain the key for the authenticated cleanup action. */ }
      }
      if (removed.length) await clearCmsGalleryCleanupKeys(id, completed.revision, removed);
    }
    return { kind: 'saved' as const };
  });

  if (result.status === 'unauthenticated' || result.status === 'unauthorized') {
    return response(403, { error: 'Request denied.' });
  }
  if (result.status !== 'ok') return response(503, { error: 'Upload could not be completed.' });
  if (result.value.kind === 'invalid') return response(400, { error: 'Unsupported image file.' });
  if (result.value.kind === 'retry-later') return response(409, { error: 'Upload retry is delayed.', retryLater: true });
  if (result.value.kind === 'stale') return response(409, { error: 'Draft changed.', stale: true });
  if (result.value.kind === 'storage-failure') return response(503, { error: 'Upload could not be completed.' });
  return response(200, { ok: true });
}
