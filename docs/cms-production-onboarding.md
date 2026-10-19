# Educatia CMS production onboarding (internal)

**Purpose:** safely operate the editorial workspace without activating student records, donation processing, or text publishing before role testing and required approvals. Gallery media has separate controls documented in `docs/cms-gallery-operations.md`.

## Intended production roles

- Editor: `educatiawelfaretrust@gmail.com`
- Publisher: `bhupendramishra216@gmail.com`
- Protected editorial workspace: `https://educatiawelfaretrust.org/admin/content`
- Published feed: `https://educatiawelfaretrust.org/news-updates`
- Authorized Google OAuth callback: `https://educatiawelfaretrust.org/api/auth/callback/google`

## Stage A — Connect and sign in, not publish

- Production Netlify must have a valid `MONGODB_URI` for a database user with least-privilege access to the `educatia` database; avoid granting general access to other project databases.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET` and `NEXTAUTH_URL` must be set as server-side settings; never expose secrets in pull requests, logs, or screenshots. Confirm both staff accounts can access the Google OAuth application and that the callback is exact.
- `CMS_EDITOR_EMAILS` and `CMS_PUBLISHER_EMAILS` are independent allowlists. These do **not** grant applicant administration privileges.
- Set `CMS_CONTENT_ENABLED=true` with `CMS_PUBLISHING_ENABLED=false`. Keep `APPLICATION_STORAGE_ENABLED=false` and `ADMIN_APPLICATIONS_ENABLED=false`. Do not change gallery flags as part of text-CMS operations; follow `docs/cms-gallery-operations.md` for their separate approved state. Netlify environment changes require a new production build to affect the live functions.
- Verify the production deploy commit hash and that signed-out `/admin/content` asks for a team Google sign-in, rather than leaking drafts or operational diagnostics.
- From the Editor Google account, sign in and **read** the empty/list dashboard. This read exercises application authentication and MongoDB access. Confirm an unallowlisted Google account is denied, with no CMS data.
- From the Publisher Google account, sign in and check reviewer visibility. With `CMS_PUBLISHING_ENABLED=false`, publish actions remain unavailable; authorized Publishers can still return items for correction or archive/unpublish existing posts. Do not publish a real update without a verified source and completed privacy review.
- If login fails, check OAuth consent-screen/test users, Google callback, NextAuth URL/session settings and function logs without exposing credentials. If the dashboard fails after successful login, inspect least-privileged database credentials, DNS and Atlas network access. Do not open `0.0.0.0/0` as a troubleshooting shortcut.

## Stage B — Editorial acceptance and separate publication approval

- With a safe isolated test dataset or authorized disposable synthetic draft, test draft, edit, submit, reject/return, distinct-person publisher approval, publication, archive/unpublish and stale-revision conflict. Ensure a plan to delete synthetic drafts; do not leave them as misleading content.
- For new text submissions, require an opaque 2–80 character source-register reference (`A-Z`, `a-z`, digits, `.`, `_`, `/`, `-` only). Do not paste source text, names, contact details, consent records, or other sensitive information into this field. Publishers independently verify the source, factual claims (including dates and figures), and privacy before publication. Do not identify children; exceptional child-related mentions require separately documented safeguarding approval. The workflow attestations document that review; they are not proof of consent or legal approval.
- Return items using the fixed reason list rather than free-text comments. A Publisher may return a review item or archive/unpublish an existing item while `CMS_PUBLISHING_ENABLED=false`; publishing itself remains disabled until separately authorized.
- When all checks pass and the team has accepted the publishing responsibilities, explicitly switch `CMS_PUBLISHING_ENABLED=true`, and verify the new production deploy. Do not bypass the separate reviewer requirement.
- Published text must be verified, non-sensitive and free of identifiable children's details. Photo storage and publication require the separate decisions in `docs/cms-gallery-operations.md`; do not enable photo gates based only on successful code or build checks.
- Rollback: `CMS_PUBLISHING_ENABLED=false` immediately freezes publishing, and `CMS_CONTENT_ENABLED=false` closes editorial access. Both require a new Netlify deployment to affect already-running production functions. Preserve authentic published records; do not silently erase content.

## Evidence log

Record date, deployment commit, login tests by role, independent publication denial, database permission review, and reviewer sign-off before treating Stage B as accepted. A green CI or Netlify build alone does not prove Google sign-in or database connectivity. Do not paste passwords, database URIs, ID tokens, or secrets into evidence.
