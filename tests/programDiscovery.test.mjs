import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('homepage and program page surface direct routes to program exploration and real contact', async () => {
  const hero = await read('src/components/Hero.tsx');
  const programs = await read('src/app/programs/page.tsx');
  assert.match(hero, /href="\/programs"/);
  assert.match(hero, /Explore Programs/);
  assert.match(programs, /href="\/become-a-member"/);
  assert.match(programs, /href="\/contact"/);
  assert.match(programs, /aria-label=\{`Ask about/);
});

test('program ItemList structured data uses only listed programs and canonical site URLs', async () => {
  const page = await read('src/app/programs/page.tsx');
  assert.match(page, /import \{ createPageMetadata, siteUrl \}/);
  assert.match(page, /'@type': 'ItemList'/);
  assert.match(page, /itemListElement: menu\.map/);
  assert.match(page, /url: \`\$\{siteUrl\}\$\{program\.href\}\`/);
  assert.match(page, /JSON\.stringify\(programListSchema\)\.replace/);
  assert.doesNotMatch(page, /aggregateRating|reviewCount|accreditation|sameAs/);
});

test('sitemap does not falsely claim every page was modified during a build', async () => {
  const sitemap = await read('src/app/sitemap.ts');
  assert.doesNotMatch(sitemap, /new Date\(\)|lastModified: now/);
  assert.match(sitemap, /academicsSubcategories/);
  assert.match(sitemap, /skillDevelopmentSubcategories/);
});

test('news teaser does not imply unsupported events already happened', async () => {
  const home = await read('src/app/page.tsx');
  assert.doesNotMatch(home, /Follow school visits, district launches/);
  assert.match(home, /as they become available/);
});
