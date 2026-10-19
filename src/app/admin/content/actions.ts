'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createCmsPost, editCmsPost, submitCmsPost, publishCmsPost,
  archiveCmsPost, returnCmsPostToDraft, withCmsAccess
} from '@/lib/cmsStore';
import { isCmsId, parseCmsFields, CmsValidationError } from '@/lib/cmsContent';

function fields(form: FormData, keys: readonly string[]) {
  const entries = Array.from(form.entries());
  const received = entries.map(([key]) => key);
  if (received.length !== keys.length || received.some(key => !keys.includes(key)) ||
    new Set(received).size !== received.length ||
    entries.some(([, value]) => typeof value !== 'string')) {
    throw new CmsValidationError('Invalid request');
  }
  return Object.fromEntries(entries) as Record<string, string>;
}

function finish(id: string | null, status: 'saved' | 'error' | 'stale') {
  revalidatePath('/admin/content');
  if (id) revalidatePath('/admin/content/' + id);
  revalidatePath('/news-updates');
  redirect((id ? '/admin/content/' + id : '/admin/content') + '?notice=' + status);
}

export async function createCmsDraftAction(form: FormData) {
  let id: string | null = null;
  let saved = false;
  try {
    const values = fields(form, ['postId', 'kind', 'title', 'summary', 'body']);
    if (!isCmsId(values.postId)) throw new CmsValidationError('Invalid request');
    id = values.postId;
    const content = parseCmsFields({
      kind: values.kind, title: values.title, summary: values.summary, body: values.body
    });
    const result = await withCmsAccess('editor', async (email) => createCmsPost(id!, content, email));
    if (result.status === 'ok' && result.value === 'saved') saved = true;
  } catch { /* Generic response; do not log draft or applicant details. */ }
  return finish(saved ? id : null, saved ? 'saved' : 'error');
}

export async function editCmsDraftAction(form: FormData) {
  let id: string | null = null;
  let outcome: 'saved' | 'stale' | 'error' = 'error';
  try {
    const values = fields(form, ['postId', 'expectedRevision', 'kind', 'title', 'summary', 'body']);
    if (!isCmsId(values.postId) || !isCmsId(values.expectedRevision)) throw new CmsValidationError('Invalid request');
    id = values.postId;
    const content = parseCmsFields({
      kind: values.kind, title: values.title, summary: values.summary, body: values.body
    });
    const result = await withCmsAccess('editor', async () =>
      editCmsPost(id!, values.expectedRevision, content));
    if (result.status === 'ok') outcome = result.value === 'saved' ? 'saved' : 'stale';
  } catch { /* Safe generic response. */ }
  return finish(id, outcome);
}

export async function submitCmsReviewAction(form: FormData) {
  let id: string | null = null;
  let outcome: 'saved' | 'stale' | 'error' = 'error';
  try {
    const values = fields(form, ['postId', 'expectedRevision', 'evidenceNote']);
    if (!isCmsId(values.postId) || !isCmsId(values.expectedRevision)) throw new CmsValidationError('Invalid request');
    id = values.postId;
    const result = await withCmsAccess('editor', async () =>
      submitCmsPost(id!, values.expectedRevision, values.evidenceNote));
    if (result.status === 'ok') outcome = result.value === 'saved' ? 'saved' : 'stale';
  } catch { /* Safe generic response. */ }
  return finish(id, outcome);
}

export async function publishCmsPostAction(form: FormData) {
  let id: string | null = null;
  let outcome: 'saved' | 'stale' | 'error' = 'error';
  try {
    const values = fields(form, ['postId', 'expectedRevision', 'evidenceConfirmed']);
    if (!isCmsId(values.postId) || !isCmsId(values.expectedRevision) ||
      values.evidenceConfirmed !== 'yes') throw new CmsValidationError('Invalid request');
    id = values.postId;
    const result = await withCmsAccess('publisher', async (email) =>
      publishCmsPost(id!, values.expectedRevision, email));
    if (result.status === 'ok') outcome = result.value === 'saved' ? 'saved' : 'stale';
  } catch { /* Safe generic response. */ }
  return finish(id, outcome);
}

export async function returnCmsDraftAction(form: FormData) {
  let id: string | null = null;
  let outcome: 'saved' | 'stale' | 'error' = 'error';
  try {
    const values = fields(form, ['postId', 'expectedRevision', 'feedback']);
    if (!isCmsId(values.postId) || !isCmsId(values.expectedRevision)) throw new CmsValidationError('Invalid request');
    id = values.postId;
    const result = await withCmsAccess('publisher', async () =>
      returnCmsPostToDraft(id!, values.expectedRevision, values.feedback));
    if (result.status === 'ok') outcome = result.value === 'saved' ? 'saved' : 'stale';
  } catch { /* Generic response, no review content logged. */ }
  return finish(id, outcome);
}

export async function archiveCmsPostAction(form: FormData) {
  let id: string | null = null;
  let outcome: 'saved' | 'stale' | 'error' = 'error';
  try {
    const values = fields(form, ['postId', 'expectedRevision']);
    if (!isCmsId(values.postId) || !isCmsId(values.expectedRevision)) throw new CmsValidationError('Invalid request');
    id = values.postId;
    const result = await withCmsAccess('publisher', async () =>
      archiveCmsPost(id!, values.expectedRevision));
    if (result.status === 'ok') outcome = result.value === 'saved' ? 'saved' : 'stale';
  } catch { /* Safe generic response. */ }
  return finish(id, outcome);
}
