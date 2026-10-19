# Editorial CMS v1: operating guide (internal)

## Workflow
1. The Editor signs in with an authorized Google account at `/admin/content`.
2. Choose **News & Announcements**, **Program Updates**, or **Photo Gallery**. Text and photo content start as a private **draft** and are invisible publicly.
3. Save the draft, then add an internal explanation of the source/evidence and submit it for review.
4. A **different** allowlisted Publisher verifies the underlying facts and approves it. The CMS rejects self-approval.
5. Approved, published updates appear on `/news-updates`. A Publisher can archive a published item, removing it from the public feed.
6. A failed write or stale revision requires reloading and trying again. Review status locks editing; ask an administrator for a new version instead of silently overwriting reviewed content.

## Current boundaries
- Gallery uploads are independently disabled until storage location, safeguarding, retention and provider backup requirements are approved. Follow `docs/cms-gallery-operations.md` before using any photo controls.
- Editors and Publishers are configured using `CMS_EDITOR_EMAILS` and `CMS_PUBLISHER_EMAILS`. `CMS_CONTENT_ENABLED` and `CMS_PUBLISHING_ENABLED` are separate switches, both false by default. The CMS does not give access to applicant records.
- Do not add HTML or Markdown. Plain text is rendered safely by React. Do not paste private evidence into the public body; the internal evidence note is for reviewer reference and should not include applicant PII.
- The live rollout needs named editor and publisher emails, Google OAuth credentials, MongoDB connection and an approved publishing policy. Photo permissions, storage location and safeguarding must be approved under Issue #48 before real media is uploaded or published.
- This lightweight CMS intentionally has no general page builder, drag/drop layouts or third-party content processor.

## Verification before activating
- Test the editor's draft flow, the independent publisher flow, an unauthorized Google account, same-person publication denial, stale edits, and archiving with **synthetic** updates.
- Check the protected dashboard is noindex/no-store, publishing switch is off until ready, and public news displays only `published` records.
- Confirm the final GitHub Actions run, Netlify preview and production commit. No manual deployment.

## Native form compatibility

The server accepts documented Next.js `$ACTION_` metadata while strictly allowlisting all editorial fields, rejecting duplicate fields, file uploads and unknown user fields. A 16 KiB action-body ceiling accommodates UTF-8 text without allowing arbitrary uploads; individual CMS title, summary, body and evidence lengths remain enforced by `cmsContent.ts`. The higher limit applies to all Server Actions, so existing applicant administrator actions must retain their stricter field and size checks.
