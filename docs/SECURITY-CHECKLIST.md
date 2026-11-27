# HospitIA — Security and privacy gate before pilot

This repository is an MVP foundation, not yet approved for production or real guest information.

## Must complete before a hotel pilot
- [ ] Enforce rate limits on public chat (shared store, not in-memory only).
- [ ] Add spam/abuse protection and maximum daily token budget per hotel.
- [ ] Verify row-level security using two separate hotels and two separate users.
- [ ] Restrict public hotel facts to explicitly published/approved facts only.
- [ ] Do not put guest names, room numbers, payment details, ID documents or sensitive data in prompts.
- [ ] Define retention, deletion, access requests and privacy notice for France (GDPR) and Switzerland (revFADP/LPD).
- [ ] Add server-side audit logging and error monitoring with secret redaction.
- [ ] Add backups and a tested restore process.
- [ ] Add dependency/security scanning and automated build/type checks.
- [ ] Review AI Act transparency requirements for guest-facing AI.
- [ ] Review data processor agreements, hosting location and international transfers.
- [ ] Add human handoff and a staffed process for urgent guest requests.

## Current MVP limitations
- Guest chat currently does not persist conversations.
- No authenticated workflow for submitting guest service requests.
- No Stripe checkout or subscription webhooks.
- No production rate limiter.
- No formal consent/retention tooling.
- Public hotel facts are readable to anonymous users when the hotel is active; only publish non-sensitive facts.
