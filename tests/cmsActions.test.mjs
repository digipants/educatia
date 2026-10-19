import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('CMS server actions redirect only after their error handling block', async () => {
  const source = await readFile(new URL('../src/app/admin/content/actions.ts', import.meta.url), 'utf8');
  const methods = [
    'createCmsDraftAction', 'editCmsDraftAction', 'submitCmsReviewAction',
    'publishCmsPostAction', 'returnCmsDraftAction', 'archiveCmsPostAction'
  ];
  for (const name of methods) {
    const start = source.indexOf(`export async function ${name}(`);
    assert.ok(start >= 0, name);
    const next = source.indexOf('export async function ', start + 1);
    const section = source.slice(start, next < 0 ? undefined : next);
    assert.doesNotMatch(section.slice(section.indexOf('try {'), section.indexOf('} catch')), /return finish\(/,
      `${name}: Next.js navigation must not be swallowed by a broad catch`);
    assert.match(section, /return finish\(/);
  }
});
