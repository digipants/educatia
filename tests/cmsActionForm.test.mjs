import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCmsActionForm, CmsActionFormError } from '../src/lib/cmsActionForm.ts';
import { readFile } from 'node:fs/promises';

const keys = ['postId','kind','title','summary','body'];
const input = () => new FormData();
function valid() {
  const form = input();
  for (const key of keys) form.append(key, key + '-value');
  return form;
}

test('accepts native Next.js action fields alongside an exact CMS allowlist', () => {
  const form = valid();
  form.append('$ACTION_ID_abc123', '');
  form.append('$ACTION_REF_0', '');
  form.append('$ACTION_KEY', 'ref');
  const values = parseCmsActionForm(form, keys);
  assert.deepEqual(Object.keys(values), keys);
  assert.equal(values.body, 'body-value');
  assert.equal('$ACTION_KEY' in values, false);
});

test('rejects unknown user input, duplicate user keys and missing fields', () => {
  const injected = valid(); injected.append('authorEmail', 'attacker@example.test');
  const duplicate = valid(); duplicate.append('title', 'overwrite');
  const missing = valid(); missing.delete('body');
  for (const form of [injected, duplicate, missing]) {
    assert.throws(() => parseCmsActionForm(form, keys), CmsActionFormError);
  }
});

test('rejects files, spoofed unknown action fields and oversized action metadata', () => {
  const file = valid(); file.set('body', new Blob(['private']), 'private.txt');
  const unknown = valid(); unknown.append('$ACTION_FAKE', 'x');
  const oversized = valid(); oversized.append('$ACTION_REF_1', 'x'.repeat(2049));
  const tooMany = valid();
  for (let i=0;i<11;i++) tooMany.append('$ACTION_ID_' + i, 'x');
  for (const form of [file, unknown, oversized, tooMany]) {
    assert.throws(() => parseCmsActionForm(form, keys), CmsActionFormError);
  }
});

test('Server Action limit accommodates bounded UTF-8 CMS drafts', async () => {
  const config = await readFile(new URL('../next.config.mjs', import.meta.url), 'utf8');
  assert.match(config, /bodySizeLimit: '16kb'/);
});
