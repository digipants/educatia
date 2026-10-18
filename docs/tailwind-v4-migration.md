# Tailwind 4 migration — internal verification record

**Scope:** Issues #25 and #16, draft PR #26. This is internal build/review documentation, not visitor-facing content.

## Implementation

- Tailwind CSS 3.4.1 → 4.3.3, with `@tailwindcss/postcss@4.3.3` on the CI-generated lockfile; removes the old `autoprefixer` package and unused Tailwind 3 TypeScript configuration.
- Imports Tailwind through `@import "tailwindcss"` and preserves `--color-brand-primary: #0ea5e9` and `--color-brand-secondary: #0f172a` through `@theme`.
- Retains bespoke `.container`, `.btn`, `.card`, animation, responsive and reduced-motion CSS. Makes three existing native dropdown backgrounds explicit to preserve the previous form appearance.
- Does not alter Next.js application logic, Google OAuth, protected workflow, SMTP, Razorpay HTTP 503 behavior, or default-off storage/admin flags.

## Automated checks

GitHub Actions migration preflight ran on Node 22 with a freshly regenerated lockfile. `npm ci`, `npm test`, `npx tsc --noEmit`, `npm run build`, and `npm audit --omit=dev --audit-level=moderate` passed.

The generated full `npm audit --json` report yielded **0 critical, 0 high, 0 moderate, 0 low** findings (from the last documented baseline of seven build-only findings). This result applies to the audited lockfile at the CI run date and can change as new advisories are published.

## Desktop and mobile visual snapshots

A temporary, no-secret GitHub Actions check captured screenshots against the then-live Tailwind 3 production site and the Tailwind 4 local production build at desktop 1440×900 and mobile 390×844 for `/`, `/programs`, `/contact`, `/donate` and `/admin/applications` (admin features disabled). The screenshots are attached to the CI workflow's short-lived artifact.

- Homepage: same page height at both widths.
- Programs: same page height at both widths.
- Contact: 2px shorter on desktop and 4px shorter on mobile; native select background styling restored before final validation.
- Donation and disabled admin pages: same captured page height at both widths.
- Automated pixel differences include antialiasing, animations and live-site timing. They are useful regression indicators but not an accessibility or browser-compatibility certification.

## Browser compatibility decision

Tailwind 4 targets **Safari 16.4+, Chrome 111+, and Firefox 128+**. Confirm that the trust does not require old browsers or older Android WebViews before the migration is released. If legacy support is essential, defer migration and retain supported Tailwind 3 while separately mitigating or accepting its development-chain findings.

## Release safeguards

- Do not auto-enable administrator/application storage or notes.
- Do not enable online donations, reintroduce payment packages, or modify SMTP secrets.
- Review fresh ordinary GitHub Actions checks and Netlify deploy preview on the final PR head after removing the temporary migration-preflight workflow.
- Inspect the live site after deployment; rollback to the preceding commit if an unexpected browser/layout regression appears.
