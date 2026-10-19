import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = () => readFile(new URL('../src/app/become-a-member/page.tsx', import.meta.url), 'utf8');

test('role switch works with pressed state, keyboard focus and mobile-friendly layout', async () => {
  const page = await read();
  assert.match(page, /aria-pressed=\{role === key\}/);
  assert.match(page, /disabled=\{loading\}/);
  assert.match(page, /sm:grid-cols-2/);
  assert.match(page, /focus-visible:outline/);
  assert.match(page, /setForm\(\{\}\)/);
});

test('student and volunteer fields have visible wrapping labels and unchanged submitted keys', async () => {
  const page = await read();
  assert.match(page, /<label key=\{field\.name\} className="block/);
  assert.match(page, /<span className="block font-medium">\{field\.placeholder\}<\/span>/);
  assert.match(page, /type=\{field\.type \|\| 'text'\}/);
  assert.match(page, /value=\{form\[field\.name\] \?\? ''\}/);
  assert.match(page, /name: 'parentGuardianConsent'/);
  assert.match(page, /formType: roles\[role\]\.label/);
});

test('public enrollment does not display internal implementation notes and announces result', async () => {
  const page = await read();
  assert.doesNotMatch(page, /application storage has been explicitly enabled|database|deployment|vendor/i);
  assert.match(page, /aria-busy=\{loading\}/);
  assert.match(page, /<p role="status" aria-live="polite"/);
  assert.match(page, /<label key=\{field\.name\} className="flex items-start/);
});
