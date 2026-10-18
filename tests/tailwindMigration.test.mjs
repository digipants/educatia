import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function read(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('Tailwind 4 PostCSS integration and brand tokens remain configured', async () => {
  const manifest = JSON.parse(await read('package.json'));
  const postcss = await read('postcss.config.js');
  const css = await read('src/styles/globals.css');

  assert.match(manifest.devDependencies.tailwindcss, /^\^4\./);
  assert.match(manifest.devDependencies['@tailwindcss/postcss'], /^\^4\./);
  assert.equal(manifest.devDependencies.autoprefixer, undefined);

  assert.match(postcss, /'@tailwindcss\/postcss'/);
  assert.doesNotMatch(postcss, /\btailwindcss\s*:/);

  assert.match(css, /^@import "tailwindcss";/);
  assert.match(css, /--color-brand-primary:\s*#0ea5e9;/);
  assert.match(css, /--color-brand-secondary:\s*#0f172a;/);
  assert.match(css, /\.container\s*\{[^}]*@apply[^}]*max-w-6xl/s);
  assert.match(css, /\.btn\s*\{[^}]*@apply[^}]*bg-brand-primary/s);
  assert.match(css, /\.card\s*\{[^}]*@apply[^}]*bg-white/s);
});

test('public application dropdowns retain their original grey surface', async () => {
  for (const path of ['src/forms/StudentForm.tsx', 'src/forms/VolunteerForm.tsx']) {
    const source = await read(path);
    const selects = [...source.matchAll(/<select\b[\s\S]*?className="([^"]+)"/g)];
    assert.ok(selects.length > 0, `${path} has select controls`);
    for (const [, classes] of selects) {
      assert.match(classes, /\bbg-gray-200\b/, `${path} select styling`);
    }
  }
});
