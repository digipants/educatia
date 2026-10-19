'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export function GalleryUploader({ photoId, revision }: { photoId: string; revision: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return;
    setBusy(true);
    setMessage('');
    try {
      const form = new FormData(formRef.current);
      const response = await fetch(`/api/cms/gallery/${photoId}/upload`, {
        method: 'POST',
        body: form,
        credentials: 'same-origin',
        cache: 'no-store'
      });
      const result = await response.json() as { ok?: boolean; stale?: boolean; retryLater?: boolean };
      if (!response.ok || !result.ok) {
        setMessage(result.retryLater
          ? 'An earlier upload is still being processed or recently interrupted. If the photo remains pending, try again after 15 minutes.'
          : result.stale ? 'This draft changed. Refresh the page and try again.'
          : 'The image could not be processed. Check the file type and size, then try again.');
        return;
      }
      formRef.current.reset();
      setPreviewUrl('');
      setMessage('Image uploaded and optimized. The draft remains private.');
      router.refresh();
    } catch {
      setMessage('The image could not be uploaded. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return <form ref={formRef} onSubmit={upload} className="space-y-3">
    <input type="hidden" name="postId" value={photoId} />
    <input type="hidden" name="expectedRevision" value={revision} />
    <label htmlFor="gallery-photo-file" className="block space-y-1 text-sm font-medium">
      Upload a genuine activity photo
      <input id="gallery-photo-file" name="file" type="file" accept="image/jpeg,image/png,image/webp" required
        onChange={event => {
          const file = event.currentTarget.files?.[0];
          setPreviewUrl(file ? URL.createObjectURL(file) : '');
        }}
        aria-describedby="gallery-photo-help" className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
    </label>
    <p id="gallery-photo-help" className="text-xs text-slate-600">
      JPEG, PNG or WebP; 3 MB maximum. The server validates and re-encodes the image, removing embedded metadata.
    </p>
    {previewUrl ? <figure className="space-y-2">
      <img src={previewUrl} alt="Preview of the selected photo" className="max-h-72 w-full rounded-xl bg-slate-100 object-contain" />
      <figcaption className="text-xs text-slate-600">Local preview only; this image has not been uploaded yet.</figcaption>
    </figure> : null}
    <button type="submit" className="btn" disabled={busy}>{busy ? 'Uploading…' : 'Upload / replace image'}</button>
    <p role={message.startsWith('Image uploaded') ? 'status' : 'alert'} aria-live="polite" className="text-sm text-slate-700">
      {message}
    </p>
  </form>;
}
