import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const adminPages = [
  'src/app/admin/applications/page.tsx',
  'src/app/admin/applications/[id]/page.tsx'
];

test('admin application pages rely on the root layout main landmark', async () => {
  for (const path of adminPages) {
    const content = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
    assert.doesNotMatch(content, /<\/?main\b/, `${path} should not nest a main landmark`);
  }
});

test('application inbox does not describe the editable workflow as read-only', async () => {
  const inbox = await readFile(new URL('../src/app/admin/applications/page.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(inbox, /read-only/i);
});
