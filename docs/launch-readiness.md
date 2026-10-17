# Educatia launch-readiness checklist

## Razorpay status (17 October 2026)

**Activation pending.** Additional documentation is required by Razorpay. Do not enable or advertise online payment acceptance before approval.

The order API is disabled by default: `DONATIONS_ENABLED` must remain `false` (or unset). Both public donation pages currently avoid opening checkout.

## Must complete before enabling

- [ ] Submit outstanding trust documents and confirm Razorpay account approval.
- [ ] Implement and test **server-side signature verification** for checkout responses and authenticated Razorpay webhooks.
- [ ] Make event processing idempotent; reconcile captured, failed, refunded and disputed payments. An order with status `created` is not a successful donation.
- [ ] Implement donor acknowledgment and receipt issuance, with verified trust identity, tax eligibility and accurate document contents.
- [ ] Confirm 80G eligibility before making any tax-benefit claims; validate compliance with authorized trust advisers.
- [ ] Replace illustrative campaign totals and beneficiary examples with verified records and permissions. Audit news and gallery for stock photos or unverified assertions.
- [ ] Test checkout in Razorpay test mode including duplicate webhooks and failures.
- [ ] Review privacy, children/guardian consent, form abuse controls, and data-retention practices.

## Current stabilization scope

The payment API fails closed until explicitly enabled; it validates INR whole-rupee amounts within configured bounds. The general donation page and campaign no longer offer an active checkout while approval is pending. Public form inputs have basic type and length validation.

**Not yet implemented:** end-to-end payment verification, webhook processing, receipts, audit-grade donation reports, or complete form spam/rate limiting. Do not set `DONATIONS_ENABLED=true` until these are complete.
