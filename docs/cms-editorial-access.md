# Educatia editorial CMS: independent staff access

The CMS uses the existing verified Google OAuth flow but a **separate** staff allowlist.
It does not require, enable or grant access to the application inbox. Applicant records remain
behind `APPLICATION_STORAGE_ENABLED=false` and `ADMIN_APPLICATIONS_ENABLED=false`.

- `CMS_CONTENT_ENABLED=false`: off by default. When enabled with valid MongoDB, Google OAuth,
  NextAuth credentials and at least one exact allowlisted email, authorized team members may sign in.
- `CMS_EDITOR_EMAILS`: comma-delimited editor emails, authorized to work on drafts.
- `CMS_PUBLISHER_EMAILS`: separate senior reviewers, authorized to approve publication.
- `CMS_PUBLISHING_ENABLED=false`: separate default-off publishing switch.
  Disabling this blocks publishing even for allowlisted publishers.
- Never put any of these email allowlists into client bundles. Do not expose secret values.
- Approved public content is separate from protected student application records.
- Text-only editorial development precedes media upload. Do not publish named minors,
  identifiable photographs, sensitive applicant records or undocumented achievements.

This change only creates the authorization foundation and tests. The editorial UI and public
publishing feed are implemented in separate reviewed tasks.
