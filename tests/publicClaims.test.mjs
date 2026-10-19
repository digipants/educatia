import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('news is not populated with unsupported past events or identifiable learner stories', async () => {
  const page = await read('src/app/news-updates/page.tsx');
  for (const pattern of [
    /STEM Lab Demo at ZPHS Kadapa/,
    /Gadchiroli & Chandrapur/,
    /Ayesha builds her first app/,
    /Rohan.s Weekend Math Labs/,
    /212 students|180 students|86%|18% score lift/i
  ]) assert.doesNotMatch(page, pattern);
  assert.match(page, /href="\/programs"/);
  assert.match(page, /href="\/contact"/);
  assert.doesNotMatch(page, /unsplash\.com|<Image\b/);
});

test('gallery does not label unrelated borrowed photographs as proof of Educatia events', async () => {
  const page = await read('src/app/gallery/page.tsx');
  assert.match(page, /href="\/programs"/);
  assert.match(page, /href="\/contact"/);
  assert.doesNotMatch(page, /Visual proof from classrooms|images\.unsplash|istockphoto|media\.licdn|pointsoflight|isrgrajan|indiaeducationdiary|fonda\.asso/);
});

test('unsupported dormant numeric impact widget is removed', async () => {
  const home = await read('src/app/page.tsx');
  assert.doesNotMatch(home, /ImpactStats/);
  await assert.rejects(read('src/components/ImpactStats.tsx'), /ENOENT/);
});
