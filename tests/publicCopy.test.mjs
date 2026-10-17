import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const publicCopyFiles = [
  'src/app/donate/page.tsx',
  'src/app/donation-campaign/page.tsx',
  'src/components/Footer.tsx',
  'src/components/Navbar.tsx',
  'src/components/Hero.tsx',
  'src/components/DonationCard.tsx'
];

const forbiddenPublicCopy = [
  /razorpay/i,
  /webhooks?/i,
  /payment verification/i,
  /pending (?:submission|approval|documents)/i,
  /approval of required documents/i,
  /\b12a\b/i,
  /\b80g\b/i,
  /trusted by schools/i,
  /secure payments/i,
  /verified funding targets/i,
  /beneficiary profiles/i,
  /impact reports/i,
  /donation receipts/i,
  /donate now/i
];

test('prominent public support surfaces avoid internal launch notes and unverified trust claims', async () => {
  for (const path of publicCopyFiles) {
    const content = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
    for (const phrase of forbiddenPublicCopy) {
      assert.doesNotMatch(content, phrase, `${path} contains forbidden public copy: ${phrase}`);
    }
  }
});
