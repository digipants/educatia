# CMS database connection incident runbook (internal)

## Verified production evidence, 19 October 2026

- Repository: `digipants/educatia`. Netlify production site: `educatiawelfaretrust.org`.
- Production deployment of 71aa135 was ready at 06:14 UTC. CMS OAuth credentials, an encrypted `MONGODB_URI`, role allowlists and `CMS_CONTENT_ENABLED=true` exist in the **production** Netlify context.
- The Editor previously established a Google session, but authenticated GET requests to `/admin/content` at 06:14 and 06:33 UTC logged `educatia_cms_operation_failure database_server_error`. HTTP 200 is the generic error-page response, **not** a successful database read.
- Netlify's secret mask does **not** prove the MongoDB URI's database name, user, password, authentication source, or database permissions are correct.
- MongoDB Atlas connector could not read projects: the Atlas organization has AI-client access disabled. No Atlas access lists, users or connection strings were changed.
- This code change improves connection sharing and adds safe error categories; **it does not establish successful production connectivity**.

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
