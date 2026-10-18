import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const forms = [
  'src/forms/StudentForm.tsx',
  'src/forms/VolunteerForm.tsx',
  'src/forms/ParentForm.tsx',
  'src/forms/TeacherForm.tsx'
];

test('public forms expose programmatic accessible names for their editable fields', async () => {
  for (const path of forms) {
    const source = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
    const controls = [...source.matchAll(/<(input|select|textarea)\b([\s\S]*?)(?:\/>|>)/g)];
    assert.ok(controls.length > 0, `${path} contains editable controls`);
    for (const [, , attributes] of controls) {
      if (/type="checkbox"/.test(attributes)) {
        assert.match(source, /<label[^>]*>[\s\S]*?type="checkbox"[\s\S]*?<\/label>/, `${path} checkbox must retain its wrapping label`);
      } else {
        assert.match(attributes, /aria-label="[^"]+"/, `${path} has an unnamed field`);
      }
    }
  }
});

test('each public form conveys busy state and asynchronously announces feedback', async () => {
  for (const path of forms) {
    const source = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
    assert.match(source, /<form\b[^>]*aria-busy=\{loading\}/);
    assert.match(source, /<p\s+role="status"\s+aria-live="polite"/);
    assert.match(source, /<button[^>]*type="submit"[^>]*disabled=\{loading\}/);
  }
});
