# Agent Injection Lab Site

Public preview site for Agent Injection Lab.

This repository contains the static public preview website that supports transparency around Agent Injection Lab and its local staging tests for AI coding agents exposed to untrusted sources.

## What This Site Contains

- Agent Injection Lab project page
- Local test guide
- Scenario Catalog
- Live Evidence Gallery with static fallback
- Phase 0.1 PRD

## Current Preview Status

This is a public preview site. Phase 0.1 live submissions are enabled through a Cloudflare Worker API and D1-backed storage for sanitized observations.

If the API or D1 binding is unavailable, the Evidence Gallery uses sample anonymized observations as a fallback. No full evidence upload is accepted.

## Not Implemented Yet

- upload flow
- accounts
- analytics

## Phase 0.1 Backend Foundation

The repository includes:

- strict anonymized summary validator
- `POST /api/agent-injection-lab/submissions`
- `GET /api/agent-injection-lab/observations`
- `GET /api/agent-injection-lab/observations/:submission_id`
- D1 migration for sanitized observations

Live submission is active after the D1 database migration has been applied and the Worker is deployed. The gallery only reads sanitized visible observations.

## Related Repository

Agent Injection Lab CLI:

https://github.com/zizewan-bot/agent-injection-lab

## Local Development

```bash
npm install
npm run dev
npm run build
```

## License and Content Rights

Application/source code is licensed under `AGPL-3.0-only`. See [LICENSE](./LICENSE).

Personal content, screenshots, writing, project narrative, and branding are not automatically licensed for reuse. See [NOTICE.md](./NOTICE.md).
