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

## Recommended control baseline (proposal, not a signed policy)

Use the official **India DPDP Act/Rules** for applicable statutory obligations and commencement, **OWASP ASVS 5.0** for application authorization and sensitive-data protection, **NIST Privacy Framework** for minimization and data lifecycle, and **WCAG 2.2 AA** for form/admin accessibility. These frameworks guide engineering; they do **not** supply a universally mandated Student/Volunteer retention period.

A trust-designated decision maker and qualified adviser must sign off **separately** on each class of data. Candidate minimum-necessary periods should be derived from the actual program purpose, pending applications, legal hold obligations and restore windows, rather than copying an unrelated company's arbitrary 30/90/365-day value. The **retention clock trigger** (submission, last meaningful contact, closure or verified withdrawal) must be selected explicitly. Define a path for correction/withdrawal requests with appropriate identity/guardian verification and safeguarding exceptions. No automatic TTL or erasure may be turned on while these decisions are pending.

**Email is independently in scope.** With `APPLICATION_STORAGE_ENABLED=false`, the server emails an allowlisted minimal Student/Volunteer contact notification; even these names, guardian/contact details and applicant details can be sensitive and require mailbox controls. Other submitted fields, including DOB, gender, student direct contact, and volunteer street address are excluded from the mail notification. Record who may open, forward, export and delete those mailbox messages, how long mailbox trash/backups retain them, whether mail is encrypted at rest/in transit, and how deletion requests propagate across copies. Retiring MongoDB records does not satisfy mailbox and backup deletion by itself.

**Guardian acknowledgment is not verification.** The Student form currently requires a `parentGuardianConsent` checkbox, but the website does not establish the guardian's verified identity/age from that checkbox. The public privacy statement about children's consent must be reviewed against this factual behavior. Linked implementation/legal review: [Issue #27](https://github.com/digipants/educatia/issues/27). Do not alter legal claims until approved.

**Phased statutory commencement:** Government Gazette notification G.S.R. 846(E), dated 13 November 2025, brings Rules 1–2 and 17–21 into effect on publication; Rule 4 starts after one year; Rules 3 and 5–16 and 22–23 after eighteen months. An authorized adviser must check the applicable Act provisions, latest amendments/exemptions and effective dates before approving changes.

### References (standards, not audit certificates)

- Government of India, DPDP Rules, 2025: https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf
- NIST Privacy Framework: https://www.nist.gov/privacy-framework
- OWASP ASVS 5.0, data protection / access control: https://github.com/OWASP/ASVS/tree/master/5.0
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/


