# Application retention and safeguarding — decision record

**Status: Draft for trust approval. Not an approved policy or authorization to activate storage or internal notes.**

This decision record covers student and volunteer application data, their administrative status/assignment metadata, and any **future** internal notes. The existing public forms also send email notifications; email inbox retention and its backups need separate review even while MongoDB storage is off.

## Decisions that the trust must approve

| Decision | Trust-approved answer | Accountable reviewer |
| --- | --- | --- |
| Purpose of each stored field and lawful collection/guardian-consent process | **Not yet decided** | Trust/safeguarding lead |
| Student application retention period and starting event | **Not yet decided** | Trust/safeguarding lead |
| Volunteer application retention period and starting event | **Not yet decided** | Trust/operations lead |
| Internal note necessity and permitted content (no unnecessary child details) | **Not yet decided** | Trust/safeguarding lead |
| Notes retention/deletion period and event trigger | **Not yet decided** | Trust/safeguarding lead |
| Access roles and review of the `ADMIN_EMAILS` allowlist | **Not yet decided** | Trust/operations lead |
| Request handling: access, correction, withdrawal, deletion and safeguarding exceptions | **Not yet decided** | Trust/safeguarding lead |
| Primary database deletion process, proof of completion and operator | **Not yet decided** | Trust/operations lead |
| Backup retention, restore windows, deletion limitations and post-restore re-deletion | **Not yet decided** | Trust/operations lead |
| Notification emails, mailbox copies, exports, logs and third-party processors | **Not yet decided** | Trust/operations lead |
| Privacy notice/consent wording and review by applicable legal advisers | **Not yet decided** | Trust/authorized adviser |
| Approval date, approver and policy revision | **Not yet decided** | Trust management |

Do not fill these blanks with guessed retention durations or infer that a technical feature implements legal compliance.

## Implementation and verification gates

- [ ] Document and approve the retention/deletion and safeguarding decisions above, including backup limitations.
- [ ] Confirm the public privacy notice and guardian consent accurately describe actual processing; verify forms and email notifications separately.
- [ ] Verify least-privilege access, current Google OAuth administrator allowlist, administrator offboarding and no public read endpoints.
- [ ] Plan and test application deletion for records, associated workflow metadata and any future notes; include idempotency, audit-safe confirmation, errors and incomplete deletion reporting.
- [ ] Verify email mailbox and backup handling separately from MongoDB. A MongoDB TTL index **cannot** erase mail, copies or backups.
- [ ] Document restores and how deletion requests are reapplied to restored data.
- [ ] Review logs, secrets, storage locations, encryption, incidents and operator responsibilities without copying applicant data into tests or logs.
- [ ] Conduct an end-to-end review of deletion and access using **synthetic** Student and Volunteer fixtures, without changing production data.
- [ ] Record explicit trust approval before enabling `APPLICATION_STORAGE_ENABLED` or `ADMIN_APPLICATIONS_ENABLED`.
- [ ] If notes are later approved, design separate bounded plain-text storage and deletion controls in a **new** narrowly scoped PR, then test them before activation.

## Present technical state

Application storage and administrator access are **disabled by default**. The protected inbox can display latest status and assignment metadata and a bounded, server-derived activity snapshot when all access prerequisites are deliberately enabled. It is **not** a durable historical audit log. Internal free-text notes and application retention/deletion automation are **not implemented**. Do not infer missing safeguards from a passing build or a Netlify preview.

This document is internal operational guidance, not visitor-facing text or a published privacy policy.
