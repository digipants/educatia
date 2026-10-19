import 'server-only';
import { getDeployStore, getStore } from '@netlify/blobs';
import { getCmsGalleryConfiguration } from './cmsGallerySecurity';

export interface GalleryObjectStore {
  put(key: string, content: Uint8Array): Promise<void>;
  get(key: string): Promise<Uint8Array | null>;
  delete(key: string): Promise<void>;
}

export function getGalleryObjectStore(): GalleryObjectStore {
  const { storageRegion } = getCmsGalleryConfiguration(process.env);
  if (!storageRegion || !process.env.NETLIFY) throw new Error('Gallery object storage is unavailable');

  // Production persists across deploys; non-production data is isolated to its deploy.
  const store = process.env.CONTEXT === 'production'
    ? getStore({ name: 'educatia-gallery-production', region: storageRegion, consistency: 'strong' })
    : getDeployStore({ name: 'educatia-gallery-preview', region: storageRegion, consistency: 'strong' });

  return {
    async put(key, content) {
      await store.set(key, new Blob([content]), { metadata: { contentType: 'image/webp' } });
    },
    async get(key) {
      const data = await store.get(key, { type: 'arrayBuffer', consistency: 'strong' });
      return data ? new Uint8Array(data) : null;
    },
    delete: key => store.delete(key)
  };
}
