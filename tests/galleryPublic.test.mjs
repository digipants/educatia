import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('public Gallery uses only published-ready CMS photos and remains a dynamic page', async () => {
  const page = await readFile(new URL('../src/app/gallery/page.tsx', import.meta.url), 'utf8');
  const store = await readFile(new URL('../src/lib/cmsGalleryStore.ts', import.meta.url), 'utf8');

  assert.match(page, /export const dynamic = 'force-dynamic'/);
  assert.match(page, /export const revalidate = 0/);
  assert.match(page, /await listPublishedCmsGalleryPhotos\(\)/);
  assert.match(store, /if \(!config\.publishingEnabled\) return \[\]/);
  assert.match(store, /kind: 'gallery-photo', status: 'published', mediaState: 'ready'/);
  assert.match(store, /\.limit\(60\)/);
  assert.doesNotMatch(page, /GalleryGrid|unsplash|student names/i);
});

test('public Gallery previews are keyboard-operable, responsive, lazy and have an honest empty state', async () => {
  const page = await readFile(new URL('../src/app/gallery/page.tsx', import.meta.url), 'utf8');

  assert.match(page, /<details className=/);
  assert.match(page, /<summary className=/);
  assert.match(page, /<img src=\{`\/api\/cms\/gallery\/\$\{photo\.id\}\/media\/thumbnail`\} alt=\{photo\.altText\}/);
  assert.match(page, /\/media\/display/);
  assert.match(page, /loading="lazy" decoding="async"/);
  assert.match(page, /sm:grid-cols-2 lg:grid-cols-3/);
  assert.match(page, /photo\.caption/);
  assert.match(page, /categoryLabels\[photo\.category\]/);
  assert.match(page, /There are no approved photographs to display right now/);
  assert.match(page, /href="\/programs"/);
  assert.match(page, /href="\/contact"/);
});
