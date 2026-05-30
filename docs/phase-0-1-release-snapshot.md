# Phase 0.1 Release Snapshot

## Release Status

Phase 0.1 opt-in anonymized submission is end-to-end verified.

The verified flow is:

`local report.html -> preview anonymized summary -> voluntary submit -> live API -> D1 -> Evidence Gallery with submission=<id>`

## Public URLs

- Live site: https://agent-injection-lab-site.stanleyr-wan.workers.dev
- CLI repo: https://github.com/zizewan-bot/agent-injection-lab
- Site repo: https://github.com/zizewan-bot/agent-injection-lab-site
- Evidence Gallery route: https://agent-injection-lab-site.stanleyr-wan.workers.dev/projects/agent-injection-lab/evidence
- Test Guide route: https://agent-injection-lab-site.stanleyr-wan.workers.dev/projects/agent-injection-lab/test
- Scenario Catalog route: https://agent-injection-lab-site.stanleyr-wan.workers.dev/projects/agent-injection-lab/scenarios

## Implemented

- CLI `report.html` preview-and-submit UI
- no automatic upload
- strict anonymized payload allowlist
- `POST /api/agent-injection-lab/submissions`
- `GET /api/agent-injection-lab/observations`
- `GET /api/agent-injection-lab/observations/:submission_id`
- D1 observations storage
- Gallery live aggregate stats
- Gallery submission lookup with `submission=<id>`
- Open Transparency copy

## Not Implemented

- full evidence upload
- `report.html` upload
- `events.jsonl` upload
- source code upload
- Git diff upload
- prompt upload
- accounts
- analytics
- ranking, leaderboard, scoring, or certification
- network exfiltration testing
- Phase 1 additional scenarios

## Privacy Boundaries

The public gallery never displays:

- full reports
- `events.jsonl`
- source code
- Git diffs
- prompts
- absolute paths
- real secrets
- emails
- IP addresses
- full run folders

## D1 / Deployment State

- Database name: `agent_injection_lab_observations`
- Binding: `DB`
- Migration: `migrations/0001_create_observations.sql`
- Deployment path: Wrangler / Workers Static Assets
- SPA fallback: handled by `wrangler.jsonc`

This snapshot intentionally does not include private Cloudflare account IDs or secrets.

## E2E Verification

- Local `report.html` submit flow passed.
- Evidence Gallery displayed the submitted observation.
- Known verified submission: `sub_e7422cbc08ea1d71186c13de58cc93f0`
- Unknown field `run_id` was rejected by the API.
- API responses did not expose internal metadata.
- Latest live-state polish commit: `97f1643 polish: update evidence gallery live-state copy`

## Known Limitations

- Phase 0 only observes local staging behavior.
- Network exfiltration is not tested.
- A clean result does not prove an agent is safe.
- Critical local staging does not prove network exfiltration.
- Current scenario coverage is limited to `dependency_resolver_staging`.

## Next Recommended Step

Prepare a seed-user invitation package:

- invite 3-5 users
- ask them to run the Test Guide
- ask them to submit an anonymized result from `report.html`
- ask them to report confusion points and the agent they used
