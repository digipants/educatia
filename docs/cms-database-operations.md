# CMS database connection incident runbook (internal)

## Verified production evidence, 19 October 2026

- Repository: `digipants/educatia`. Netlify production site: `educatiawelfaretrust.org`.
- Production deployment of 71aa135 was ready at 06:14 UTC. CMS OAuth credentials, an encrypted `MONGODB_URI`, role allowlists and `CMS_CONTENT_ENABLED=true` exist in the **production** Netlify context.
- The Editor previously established a Google session, but authenticated GET requests to `/admin/content` at 06:14 and 06:33 UTC logged `educatia_cms_operation_failure database_server_error`. HTTP 200 is the generic error-page response, **not** a successful database read.
- Netlify's secret mask does **not** prove the MongoDB URI's database name, user, password, authentication source, or database permissions are correct.
- MongoDB Atlas connector could not read projects: the Atlas organization has AI-client access disabled. No Atlas access lists, users or connection strings were changed.
- This code change improves connection sharing and adds safe error categories; **it does not establish successful production connectivity**.

## Resolution and current status, 19 October 2026

- The production failure was confirmed as MongoDB error 13297 (`DatabaseDifferCase`): Atlas had the empty, case-distinct `Educatia.CMS` namespace while the application uses lowercase `educatia.cmsPosts`. This was not a NextAuth failure or a speculative connection-pool issue.
- With owner approval, only the empty `Educatia` database and its empty `CMS` collection/index were removed. The existing `educatia.cmsPosts` collection and its index were preserved; the Atlas database user is scoped to the CMS collection.
- After the namespace correction, the allowlisted Editor loaded the production workspace, created and edited a synthetic draft, and submitted it for review. The separate allowlisted Publisher independently loaded that review item. A signed-out request was denied. These checks confirmed production database reads and writes without publishing test content.
- Production still has `CMS_CONTENT_ENABLED=true` and `CMS_PUBLISHING_ENABLED=false`; applicant storage/admin remain off and Razorpay remains disabled. No public publication was attempted.
- Before cleanup, the synthetic review item was inspected in the Editor workspace and Atlas. Its title was `Internal CMS verification - DO NOT PUBLISH (edited)`, status `review`, and SHA-256 of its record UUID was `9313e6db8d969b5f29beb27c9f50b09f2ac52b2362a7ccff8513d0cf46f9efcc`. The exact-ID query matched one record; only that record was deleted with owner approval. Atlas then returned zero matches, the CMS dashboard showed no drafts or updates, and `/news-updates` showed its empty state. No applicant or child data was involved.
- The Atlas Network Access list still contains an unrestricted `0.0.0.0/0` rule. It was not changed during database recovery. Follow-up security work is tracked separately in [Issue #62](https://github.com/digipants/educatia/issues/62); do not remove the rule until a tested replacement egress route exists.
- Production return-to-draft, publish and archive are not considered accepted: publishing remains paused. Exercise those transitions only against isolated synthetic data, then obtain documented editorial authorization before changing the production publishing flag.

## Reproduce without exposing secrets

1. Confirm the exact production deploy commit and check only the presence and scopes (functions/runtime) of `MONGODB_URI`. Never copy its value to a ticket, browser console, chat or GitHub.
2. From an allowlisted staff account, reload `/admin/content` once. Filter Netlify function logs for `educatia_cms_operation_failure`; do not share full logged request URLs because OAuth query parameters may appear.
3. Interpret the fixed category:
   - `database_authentication`: MongoDB error code 18. Inspect the Atlas database user's username, credential, password URL encoding and authentication source.
   - `database_permission`: MongoDB error code 13. Confirm the DB user has only the needed `readWrite` role on database `educatia`. Listing requires read privileges; draft/review workflows also require writes.
   - `database_unreachable`, `database_network`, `database_timeout`: check cluster availability, DNS/TLS and approved network egress from Netlify's serverless runtime.
   - `database_pool_timeout`: inspect concurrent load/pool exhaustion.
   - `database_configuration`: inspect URI formatting offline.
   - `database_server_error mongo_code_N`: use the numeric MongoDB error code to identify the server-side failure. Known Atlas code 8000 authentication and authorization messages are mapped to the fixed `database_authentication` and `database_permission` categories; the message itself is never logged. Never add raw exception messages, command data, hostnames, or connection details. See the [MongoDB error code reference](https://www.mongodb.com/docs/manual/reference/error-codes/).
   - `database_server_error` without a code: review Atlas server/database diagnostic tools with an authorized operator, without logging raw driver errors.
   - `unexpected`: inspect deployment config and internal application error handling without printing credentials.
4. Atlas SRV URIs commonly require an explicit authentication-source check. The application always selects database `educatia` via `client.db(DB_NAME)`; the URI pathname can still matter for authentication, so inspect the exact URI *privately* rather than inferring it from the cluster name.
5. Do **not** add `0.0.0.0/0` to Atlas network access as a shortcut. An Atlas Organization Owner must enable AI-client access before the Atlas connector can inspect this project; alternatively, an authorized operator can review it in Atlas directly.
6. Confirm an authorized Editor sees a draft list (empty is valid); confirm the Publisher and an unallowlisted account respect their roles. Use disposable synthetic content only for optional write tests, with a deletion plan.

## Publishing gate

Keep `CMS_CONTENT_ENABLED=true` for editorial diagnostics and `CMS_PUBLISHING_ENABLED=false` until connection, Editor and Publisher checks pass. Keep `APPLICATION_STORAGE_ENABLED=false`, `ADMIN_APPLICATIONS_ENABLED=false`, and Razorpay processing off. Successful CI, deploy status and generic HTTP 200 responses are **not** evidence of database connectivity. Follow `docs/cms-production-onboarding.md` for publication acceptance and rollback.
