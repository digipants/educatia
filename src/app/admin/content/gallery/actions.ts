'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  archiveCmsGalleryPhoto, beginCmsGalleryPurge, clearCmsGalleryCleanupKeys,
  createCmsGalleryPhoto, editCmsGalleryPhoto, finishCmsGalleryPurge,
  listCmsGalleryPhotos, publishCmsGalleryPhoto, readCmsGalleryCleanupKeys, withCmsGalleryAccess,
  returnCmsGalleryPhotoToDraft, submitCmsGalleryPhoto
} from '@/lib/cmsGalleryStore';
import { parseCmsActionForm } from '@/lib/cmsActionForm';
import { parseGalleryFields } from '@/lib/cmsGalleryContent';
import { getGalleryObjectStore } from '@/lib/galleryBlobStore';
import { isCmsId } from '@/lib/cmsContent';

function finish(id: string | null, notice: 'saved' | 'error' | 'stale' | 'cleanup-pending') {
  revalidatePath('/admin/content');
  revalidatePath('/admin/content/gallery');
  if (id) revalidatePath(`/admin/content/gallery/${id}`);
  revalidatePath('/gallery');
  redirect((id ? `/admin/content/gallery/${id}` : '/admin/content/gallery') + `?notice=${notice}`);
}

function exactYes(value: string) {
  if (value !== 'yes') throw new Error('Invalid request');
  return true;
}

export async function createCmsGalleryDraftAction(form: FormData) {
  let id: string | null = null;
  let saved = false;
  try {
    const values = parseCmsActionForm(form, [
      'postId', 'title', 'caption', 'altText', 'category', 'activityDate', 'displayOrder',
      'sourceReference', 'subjectVisibility', 'subjectPermissionReference', 'guardianPermissionReference'
    ]);
    if (!isCmsId(values.postId)) throw new Error('Invalid request');
    id = values.postId;
    const fields = parseGalleryFields(values);
    const result = await withCmsGalleryAccess('editor', email => createCmsGalleryPhoto(id!, fields, email));
    saved = result.status === 'ok' && result.value === 'saved';
  } catch { /* Keep draft content and file details out of logs and user-facing errors. */ }
  return finish(saved ? id : null, saved ? 'saved' : 'error');
}

export async function editCmsGalleryDraftAction(form: FormData) {
  let id: string | null = null;
  let notice: 'saved' | 'error' | 'stale' = 'error';
  try {
    const values = parseCmsActionForm(form, [
      'postId', 'expectedRevision', 'title', 'caption', 'altText', 'category', 'activityDate', 'displayOrder',
      'sourceReference', 'subjectVisibility', 'subjectPermissionReference', 'guardianPermissionReference'
    ]);
    if (!isCmsId(values.postId) || !isCmsId(values.expectedRevision)) throw new Error('Invalid request');
    id = values.postId;
    const fields = parseGalleryFields(values);
    const result = await withCmsGalleryAccess('editor', () => editCmsGalleryPhoto(id!, values.expectedRevision, fields));
    if (result.status === 'ok') notice = result.value === 'saved' ? 'saved' : 'stale';
  } catch { /* Generic response; never log private editorial fields. */ }
  return finish(id, notice);
}

export async function submitCmsGalleryReviewAction(form: FormData) {
  let id: string | null = null;
  let notice: 'saved' | 'error' | 'stale' = 'error';
  try {
    const values = parseCmsActionForm(form, ['postId', 'expectedRevision']);
    if (!isCmsId(values.postId) || !isCmsId(values.expectedRevision)) throw new Error('Invalid request');
    id = values.postId;
    const result = await withCmsGalleryAccess('editor', email =>
      submitCmsGalleryPhoto(id!, values.expectedRevision, email));
    if (result.status === 'ok') notice = result.value === 'saved' ? 'saved' : 'stale';
  } catch { /* Generic response; never log private editorial fields. */ }
  return finish(id, notice);
}

export async function returnCmsGalleryDraftAction(form: FormData) {
  let id: string | null = null;
  let notice: 'saved' | 'error' | 'stale' = 'error';
  try {
    const values = parseCmsActionForm(form, ['postId', 'expectedRevision', 'feedback']);
    if (!isCmsId(values.postId) || !isCmsId(values.expectedRevision)) throw new Error('Invalid request');
    id = values.postId;
    const result = await withCmsGalleryAccess('publisher', email =>
      returnCmsGalleryPhotoToDraft(id!, values.expectedRevision, values.feedback, email), { requirePublishing: false });
    if (result.status === 'ok') notice = result.value === 'saved' ? 'saved' : 'stale';
  } catch { /* Generic response; never log review content. */ }
  return finish(id, notice);
}

export async function publishCmsGalleryPhotoAction(form: FormData) {
  let id: string | null = null;
  let notice: 'saved' | 'error' | 'stale' = 'error';
  try {
    const values = parseCmsActionForm(form, [
      'postId', 'expectedRevision', 'sourceVerified', 'metadataPrivacyVerified',
      'subjectPermissionVerified', 'guardianPermissionVerified'
    ]);
    if (!isCmsId(values.postId) || !isCmsId(values.expectedRevision)) throw new Error('Invalid request');
    id = values.postId;
    const checks = {
      sourceVerified: exactYes(values.sourceVerified),
      metadataPrivacyVerified: exactYes(values.metadataPrivacyVerified),
      subjectPermissionVerified: values.subjectPermissionVerified === 'yes',
      guardianPermissionVerified: values.guardianPermissionVerified === 'yes'
    };
    const result = await withCmsGalleryAccess('publisher', email =>
      publishCmsGalleryPhoto(id!, values.expectedRevision, email, checks));
    if (result.status === 'ok') notice = result.value === 'saved' ? 'saved' : 'stale';
  } catch { /* Generic response; never log review content. */ }
  return finish(id, notice);
}

export async function archiveCmsGalleryPhotoAction(form: FormData) {
  let id: string | null = null;
  let notice: 'saved' | 'error' | 'stale' = 'error';
  try {
    const values = parseCmsActionForm(form, ['postId', 'expectedRevision']);
    if (!isCmsId(values.postId) || !isCmsId(values.expectedRevision)) throw new Error('Invalid request');
    id = values.postId;
    const result = await withCmsGalleryAccess('publisher', email =>
      archiveCmsGalleryPhoto(id!, values.expectedRevision, email), { requirePublishing: false });
    if (result.status === 'ok') notice = result.value === 'saved' ? 'saved' : 'stale';
  } catch { /* Generic response; never log editorial content. */ }
  return finish(id, notice);
}

export async function retryCmsGalleryCleanupAction(form: FormData) {
  let id: string | null = null;
  let notice: 'saved' | 'error' | 'stale' = 'error';
  try {
    const values = parseCmsActionForm(form, ['postId', 'expectedRevision']);
    if (!isCmsId(values.postId) || !isCmsId(values.expectedRevision)) throw new Error('Invalid request');
    id = values.postId;
    const result = await withCmsGalleryAccess('editor', async () => {
      const pending = await readCmsGalleryCleanupKeys(id!);
      if (!pending || pending.revision !== values.expectedRevision) return 'stale';
      if (!pending.keys.length) return 'saved';
      const store = getGalleryObjectStore();
      const removed: string[] = [];
      for (const key of pending.keys) {
        try { await store.delete(key); removed.push(key); } catch { /* Keep failed keys for a later retry. */ }
      }
      if (removed.length !== pending.keys.length) return 'cleanup-pending';
      return clearCmsGalleryCleanupKeys(id!, pending.revision, removed);
    });
    if (result.status === 'ok') {
      notice = result.value === 'saved' ? 'saved' : result.value === 'stale' ? 'stale' : 'error';
    }
  } catch { /* Generic response; storage keys and object details stay private. */ }
  return finish(id, notice);
}

export async function purgeCmsGalleryPhotoAction(form: FormData) {
  let id: string | null = null;
  let notice: 'saved' | 'error' | 'stale' | 'cleanup-pending' = 'error';
  try {
    const values = parseCmsActionForm(form, ['postId', 'expectedRevision', 'confirmPurge']);
    if (!isCmsId(values.postId) || !isCmsId(values.expectedRevision)) throw new Error('Invalid request');
    exactYes(values.confirmPurge);
    id = values.postId;
    const result = await withCmsGalleryAccess('publisher', async () => {
      const purge = await beginCmsGalleryPurge(id!, values.expectedRevision);
      if (!purge) return 'stale';
      const store = getGalleryObjectStore();
      const remaining: string[] = [];
      for (const key of purge.keys) {
        try { await store.delete(key); } catch { remaining.push(key); }
      }
      return finishCmsGalleryPurge(id!, purge.token, remaining);
    }, { requirePublishing: false });
    if (result.status === 'ok') {
      notice = result.value === 'deleted' ? 'saved' : result.value === 'pending' ? 'cleanup-pending' : 'stale';
    }
  } catch { /* Deletion failures do not reveal object keys or private photo details. */ }
  return finish(id, notice);
}
