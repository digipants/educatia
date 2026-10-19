import type { CmsGalleryPhoto } from './cmsGalleryContent';

export const MAX_GALLERY_CLEANUP_KEYS = 12;
const UPLOAD_RETRY_AFTER_MS = 15 * 60 * 1000;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type GalleryUploadPlan = {
  token: string;
  displayKey: string;
  thumbnailKey: string;
  previousKeys: string[];
  createdAt: Date;
};

export function galleryUploadLocked(
  photo: Pick<CmsGalleryPhoto, 'pendingUpload'>,
  now: Date
): boolean {
  const pending = photo.pendingUpload;
  return Boolean(pending && (!(pending.createdAt instanceof Date) ||
    now.getTime() - pending.createdAt.getTime() < UPLOAD_RETRY_AFTER_MS));
}

export function isSafeGalleryStorageKey(key: unknown): key is string {
  return typeof key === 'string' &&
    /^gallery\/[0-9a-f-]{36}\/[0-9a-f-]{36}\/(?:display|thumbnail)\.webp$/i.test(key);
}

export function planGalleryUpload(
  photo: Pick<CmsGalleryPhoto, 'mediaState' | 'mediaKeys' | 'pendingUpload' | 'cleanupKeys'>,
  id: string,
  token: string,
  now: Date
): GalleryUploadPlan | null {
  if (!uuidPattern.test(id) || !uuidPattern.test(token) || photo.mediaState === 'purging' || photo.mediaState === 'purged' ||
      !Array.isArray(photo.cleanupKeys) || photo.cleanupKeys.length > MAX_GALLERY_CLEANUP_KEYS) return null;
  if (photo.cleanupKeys.length) return null;

  const pending = photo.pendingUpload;
  if (galleryUploadLocked(photo, now) ||
      (pending && (!Array.isArray(pending.previousKeys) || pending.previousKeys.length > MAX_GALLERY_CLEANUP_KEYS))) return null;

  const previousKeys = Array.from(new Set([
    ...(photo.mediaKeys ? [photo.mediaKeys.display, photo.mediaKeys.thumbnail] : []),
    ...(pending ? [...pending.previousKeys, pending.displayKey, pending.thumbnailKey] : [])
  ]));
  const displayKey = `gallery/${id}/${token}/display.webp`;
  const thumbnailKey = `gallery/${id}/${token}/thumbnail.webp`;
  if (previousKeys.length > MAX_GALLERY_CLEANUP_KEYS ||
      ![displayKey, thumbnailKey, ...previousKeys].every(isSafeGalleryStorageKey)) return null;
  return { token, displayKey, thumbnailKey, previousKeys, createdAt: now };
}

export function galleryPurgeKeys(photo: Pick<CmsGalleryPhoto, 'mediaKeys' | 'pendingUpload' | 'cleanupKeys'>): string[] | null {
  if (!Array.isArray(photo.cleanupKeys) || photo.cleanupKeys.length > MAX_GALLERY_CLEANUP_KEYS + 4 ||
      (photo.pendingUpload && (!Array.isArray(photo.pendingUpload.previousKeys) ||
        photo.pendingUpload.previousKeys.length > MAX_GALLERY_CLEANUP_KEYS))) return null;
  const candidates = [
    ...photo.cleanupKeys,
    ...(photo.mediaKeys ? [photo.mediaKeys.display, photo.mediaKeys.thumbnail] : []),
    ...(photo.pendingUpload ? [photo.pendingUpload.displayKey, photo.pendingUpload.thumbnailKey, ...photo.pendingUpload.previousKeys] : [])
  ];
  if (!candidates.every(isSafeGalleryStorageKey)) return null;
  const keys = Array.from(new Set(candidates));
  return keys.length <= MAX_GALLERY_CLEANUP_KEYS + 4 ? keys : null;
}
