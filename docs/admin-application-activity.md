# Admin application activity and notes readiness

The protected application detail page currently derives a bounded timeline from the application's submission timestamp and its latest status and assignment metadata. It does not create an event collection, store note text, or change applicant records. The timeline contains at most three events and is read only through the existing Google OAuth administrator allowlist with both application feature flags enabled.

Internal notes are intentionally not implemented. Student records may include information about minors, and the repository has no approved retention period or application deletion workflow. A character limit alone would not resolve how long free-text notes remain stored. Before adding notes, agree and document the retention period, deletion procedure (including backups), access responsibilities, and safeguarding guidance. Any later notes feature must enforce bounded input and retention on the server and make that policy visible to authorized administrators.

`APPLICATION_STORAGE_ENABLED` and `ADMIN_APPLICATIONS_ENABLED` remain disabled by default; this change does not enable storage or admin access.
