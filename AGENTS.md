# Public content guidance

Before changing public-facing copy or UI, keep visitor-facing language clear, professional, and reassuring. Never put developer notes, deployment or implementation details, tooling names, technical roadmaps, pending vendor paperwork, or backend verification/testing status in public pages, navigation, campaign/donation content, footers, or user-facing errors; keep operational detail in internal documentation, issues, PRs, or authenticated admin screens.

Do not make unverified claims about legal or tax status, security, partnerships, outcomes, impact metrics, testimonials, sponsorship targets, or institutional endorsements. When online donations are unavailable, say so neutrally and provide a working contact path without naming vendors or explaining internal activation blockers. Review this guidance on all future public-copy changes.

## Standard acceptance signals for every issue or PR

Apply these **before** marking work complete; use only the standards relevant to a change.

1. **Security — OWASP ASVS 5.0:** define trust boundaries and exact server authorization before accessing protected data; permit only allowlisted fields/actions; enforce input limits, CSRF protection and generic error responses. Do not log credentials, data about children or raw form content. Never use a passing build as evidence of access-control security.
2. **Privacy — NIST Privacy Framework:** inventory every actual data flow (including email and backups); minimize at collection and persistence; document purpose, role access, retention, deletion and restoration treatment. Do not equate a checkbox with verified parent/guardian consent.
3. **Local law — India DPDP Act and notified Rules:** confirm which provisions are in force at the relevant date, whether this trust's processing is covered and whether an exemption actually applies. Use counsel/trust sign-off for lawful basis, verification method, retention periods, child safeguarding and public policy statements. Do not invent a blanket retention period or legal claim.
4. **Accessibility — W3C WCAG 2.2 AA:** use proper input labels, keyboard/focus and error handling, sufficient contrast and mobile layouts for touched public/admin screens; record manual checks where automation cannot prove conformance.
5. **Quality/release:** one bounded objective per PR, limited diffs, deterministic tests, typecheck, production build, dependency audits, real Netlify preview and exact-commit evidence; review visual regressions for UI changes. Never manually deploy without explicit approval.
6. **Production gates:** keep `APPLICATION_STORAGE_ENABLED`, `ADMIN_APPLICATIONS_ENABLED` OFF unless trust authorization is recorded; keep Razorpay order API HTTP 503 pending its separate activation checklist. Never unilaterally activate notes, storage, payments or production credentials.
7. **Evidence states:** distinguish implemented, tested, reviewed, published, legally approved and policy approved. Mark an issue complete only when all **applicable** acceptance criteria are met; keep blocked obligations open with owners and next decisions.

Standards guide engineering decisions; they **do not** substitute for trust management's approval, a qualified legal review or verification of the actual environment.

