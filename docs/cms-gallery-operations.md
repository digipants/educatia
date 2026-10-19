# CMS photo gallery operations (internal)

## Roles and workflow

- Open **Photo Gallery** from `/admin/content` using an allowlisted Google account.
- An Editor creates a private draft, adds bounded plain-text metadata and opaque references to the separate source/permission registers, previews a local photo, uploads one image, then submits the completed draft for review. Return feedback uses a short fixed list of reason codes, not free text.
- A different allowlisted Publisher reviews the optimized private preview and the underlying registers. The Publisher may return it for corrections, publish an eligible item when all gates are enabled, or archive/unpublish it. The submitter cannot approve their own item.
- Draft and review images are available only through an authenticated server route. The route never returns an object-storage URL or key. Public image access is limited to records whose status is `published` and media state is `ready`.
- An archived item can be permanently removed by a Publisher after explicit confirmation. If object deletion fails, the record retains a bounded retry queue; retry cleanup rather than removing the tracking record.

## Image handling and storage

- One file per request; JPEG, PNG and WebP only; maximum input size 3 MiB, request size 3 MiB plus multipart overhead, decoded dimensions at most 25 megapixels and 10,000 pixels per side. Animated/multi-page files are rejected.
- The server checks the signature and decoded format against the claimed MIME type, rejects malformed images, re-encodes static images to display and thumbnail WebP, and does not preserve EXIF/GPS metadata. Decode/re-encode is the current content-sanitization precaution; there is no general-purpose antivirus scanner, and uploads must remain disabled until the trust approves this risk.
- Objects are stored in private Netlify Blobs stores: a site-wide production store and deploy-scoped non-production stores. MongoDB stores metadata and opaque keys only. Production uses strong consistency; image responses are private/no-store until an item is approved, and public responses also disable CDN/browser caching so archiving removes live representations promptly.
- **Provider choice:** Netlify Blobs is the smallest operational fit because the site already runs on Netlify and Functions receive the storage context without a separate provider token. Its documented region set has no India region, so this implementation requires an explicit region and stays disabled pending data-location approval. Cloudflare R2 offers an S3-compatible API, while Amazon S3 offers region-scoped buckets and IAM policies; either would add provider account/credential and access-policy setup. No new account or paid service was created. Confirm the Netlify plan, usage limits and any billing impact before enabling storage. See the [Netlify Blobs guide](https://docs.netlify.com/build/data-and-storage/netlify-blobs/), [Cloudflare R2 S3 API](https://developers.cloudflare.com/r2/get-started/s3/) and [Amazon S3 access controls](https://docs.aws.amazon.com/AmazonS3/latest/userguide/how-s3-evaluates-access-control.html).
- `CMS_MEDIA_STORAGE_REGION` must be selected explicitly. The application fails closed for an unset or unsupported value; do not select a region until the trust has approved the data location and applicable privacy requirements. Do not add public object URLs, arbitrary external URLs, or credentials to content.
- A failed upload remains pending and can be retried after 15 minutes with new object keys. Old/partial objects are tracked for cleanup. Each request accepts one image; the CMS caps metadata and cleanup queues. Netlify Blobs provider backup/restore retention and complete erasure behavior have not been approved or independently verified; do not promise deletion from provider backups.

## Photo permissions and safeguards

- Record only opaque IDs for the trust's source/rights and permission registers. Never put a subject's name, student ID, guardian contact details, consent form, or private case information in CMS fields or review notes.
- The Publisher must inspect the underlying evidence and public metadata; workflow checkboxes record the review action and are not proof of consent. Publication requires a separate check that title, caption and alt text contain no child names, student IDs, contact details or private information. Unknown subject classification blocks publication. Identifiable adults require a verified permission reference. Identifiable minors require a reference plus separately verified guardian authorization and the additional minor-publication gate.
- Keep `CMS_MINOR_MEDIA_PUBLISHING_ENABLED=false` until the trust has documented an age-appropriate safeguarding and guardian-verification process and approved it. A subject or guardian may request removal through the trust's approved channel; a Publisher should archive the item promptly, then coordinate permanent removal from the CMS and tracked media objects.
- Trust/legal approval is still needed for lawful basis, the actual consent-verification method, retention, revocation handling, hosting location, and provider backup/restore treatment. Do not upload real photographs until those decisions are recorded.

## Feature switches

Gallery functionality is deliberately opt-in and independent from CMS text publishing:

- `CMS_MEDIA_ENABLED=true` plus `CMS_CONTENT_ENABLED=true` and an approved `CMS_MEDIA_STORAGE_REGION` enables private gallery drafts/uploads.
- `CMS_MEDIA_PUBLISHING_ENABLED=true` additionally requires `CMS_PUBLISHING_ENABLED=true` to make gallery publication available.
- `CMS_MINOR_MEDIA_PUBLISHING_ENABLED=true` is an additional gate for identifiable minors; leave it false unless approved as described above.
- All media switches default to false in `.env.example`. Do not change Netlify production settings as part of implementation or preview verification. Keep applicant storage/admin and Razorpay disabled.

## Verification and release

- Run the isolated Editor → review → independent Publisher → publish → archive/purge lifecycle with synthetic, non-identifying media only. Never publish test content to production.
- Exercise unauthorized access, self-approval, stale revisions, malformed/oversized images, partial storage writes, retries, cleanup failures and public filtering. A successful build does not establish permissions, consent, retention or production storage readiness.
- Follow `docs/cms-production-onboarding.md` for text CMS release and `docs/cms-database-operations.md` for safe database diagnostics. Track Atlas egress separately in Issue #62 and safeguarding/storage approvals in Issue #48.
