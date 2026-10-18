# Application-data flow and standards gap review

**Reviewed against `main` on 18 October 2026. Internal draft — not a legal opinion, signed data-processing policy, or authorization to activate features.**

## Actual current processing

| Input/source | Receives it | Security/privacy observation | Status |
| --- | --- | --- | --- |
| Public Student form: name, DOB, gender, grade, institute, guardian/contact, WhatsApp/email, program, guardian checkbox | `/api/forms/submit` validates and sends an SMTP notification containing an allowlisted **minimal follow-up subset** (student name, grade, institute, guardian/contact, program and guardian acknowledgment) | Email still includes child/guardian information even while MongoDB storage is off; DOB, gender and student direct contacts are not forwarded in the minimized notification. Mailbox, trash, forwards and backups have independent retention/deletion needs. | Processing exists; retention/guardian verification not approved |
| Student MongoDB projection | `educatia.applications` **only if** `APPLICATION_STORAGE_ENABLED=true` | Limited to name/grade/institute/guardian contact/program and boolean acknowledgment. DOB/gender/student WhatsApp/email omitted. | Disabled by default |
| Volunteer form | SMTP notification with allowlisted contact/expertise fields | DOB, gender and street address are validated if submitted but are excluded from the email notification and MongoDB projection. | Email processing exists |
| Volunteer MongoDB projection | Same flag-gated collection | Limited to name, mobile/WhatsApp, email and expertise. | Disabled by default |
| Protected admin inbox and detail | Google OAuth verified email, exact `ADMIN_EMAILS` allowlist plus both opt-in flags | Minimal MongoDB projections, no-store, noindex; status, assignment and latest derived three-event activity snapshot. | Disabled by default |
| Future notes | None; not implemented | Free-text notes could increase sensitive child information. No approved retention, deletion, restore, legal hold and backup handling. | Blocked |

No conclusion about real mailbox backup retention, vendor subprocessors or GDPR/DPDP compliance can be drawn from source code alone.

## Requirement verification matrix

| Standard/control family | Engineering signal | Current evidence | Next action or approval |
| --- | --- | --- | --- |
| OWASP ASVS V8 — authorization | Deny-by-default, permission checked on every server-side read/write, field-level controls, no IDOR | `src/lib/adminSecurity.ts`, admin queries, revision-safe mutation tests. | Keep regression tests green; independent abuse review before activating flags. |
| OWASP ASVS V14 — data protection | Data inventory; no secret or child data in logs; minimize and classify records, exclude sensitive URLs and caches | MongoDB projection is reduced; request handling logs generic errors. Only allowlisted minimal email notification data is sent; email copies still require retention and access control. | Review source fields, mailbox privileges and processors; confirm real operational configuration. |
| NIST Privacy Framework — lifecycle | Document collection, processing, secure deletion and backup/restore handling | `docs/application-retention-readiness.md`; no automatic deletion/retention policy. | Trust approves period, trigger, deletion owner and backup strategy, then implement tested deletion. |
| India DPDP Act and Rules | Appropriate legal basis, clear notice, applicable child/guardian protections, effective-date and exemption review | Checkbox records acknowledgment but does **not** verify parent's identity or age. Public privacy copy warrants review. | Trust legal/safeguarding owner resolves [Issue #27](https://github.com/digipants/educatia/issues/27); do not claim compliance before sign-off. |
| WCAG 2.2 AA | Programmatic labels, keyboard operation, clear errors, focus/contrast, responsive layout | Some public form fields use placeholders without visible labels; manual audit outstanding. | Accessibility remediation in a separate, focused UI PR with screen-reader/keyboard/mobile checks. |
| Tested rollout | Synthetic fixtures, GitHub CI, Netlify preview at exact SHA, no manual deploy | CI workflow exists, sensitive flags default off and Razorpay order API remains 503. | Retest all affected behaviors; never activate data processing based on a preview alone. |

## Decisions still reserved for trust management

- Whether the trust falls within specific educational exceptions, and how children's personal data may lawfully be processed.
- Mechanism for verifying the parent/guardian where required; treatment of withdrawn/disputed consent.
- Purpose and proportionate retention periods for Student/Volunteer records, emails, notes and backups.
- Exceptions for legal/safeguarding holds, responsible data officer, approved access roles and handling of erasure/correction requests.
- Whether internal notes are necessary at all, and how to prevent copying extra personal information into them.

**Release posture:** Keep Issue #18 open. No notes storage or automatic deletion is implemented. `APPLICATION_STORAGE_ENABLED` and `ADMIN_APPLICATIONS_ENABLED` remain OFF. Do not change payments, secrets or visitor-facing legal text through this standards-only change.
