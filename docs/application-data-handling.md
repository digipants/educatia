# Student and volunteer application storage

Application storage is disabled by default. Set the server-only environment variable `APPLICATION_STORAGE_ENABLED=true` only after the trust has approved the database, access controls, backups, and retention schedule. Configure `MONGODB_URI` as a private server environment variable; never expose it with a `NEXT_PUBLIC_` prefix. The existing email notification continues to receive submissions in either mode.

When enabled, Student and Volunteer submissions are saved to the `educatia.applications` collection before the success response is returned. Parent and Teacher submissions remain email-only. There is no public read or listing endpoint.

Stored Student data is limited to name, class/grade, institute, parent/guardian name and contact number, selected program, and the consent acknowledgment. Date of birth, gender, student WhatsApp number, and email ID are not copied to MongoDB. Stored Volunteer data is limited to name, mobile, WhatsApp, email, and offered service/expertise. Date of birth, gender, and street address remain in the existing email notification and are not copied to MongoDB. Raw request headers, IP addresses, and arbitrary submitted keys are not stored.

The guardian checkbox records an acknowledgment that the information may be used to review and respond to an application. It is not a determination of legal compliance or a substitute for the trust's privacy and safeguarding obligations.

No automatic deletion or TTL policy is implemented. Records remain in MongoDB until an authorized database operator deletes them. The trust must establish and document an appropriate retention period before enabling storage. Application values are not written to server logs; operational errors use generic messages.

An idempotency key is generated for Student and Volunteer submissions and stored as the MongoDB document ID. Retries in the same page session reuse the key, preventing duplicate records and duplicate email notifications. A retry after a page reload receives a new key, so a lost response followed by a reload can still create a duplicate application.
