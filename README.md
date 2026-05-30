# Agent Injection Lab Site

Public preview site for Agent Injection Lab.

This repository contains the static public preview website that supports transparency around Agent Injection Lab and its local staging tests for AI coding agents exposed to untrusted sources.

## What This Site Contains

- Agent Injection Lab project page
- Local test guide
- Scenario Catalog
- Static Evidence Gallery preview
- Phase 0.1 PRD

## Current Preview Status

This is a public preview site. Phase 0.1 backend code is present, but live submissions require Cloudflare D1 setup before they are active.

Until the `DB` D1 binding is configured and deployed, the Evidence Gallery uses sample anonymized observations as a fallback. No full evidence upload is accepted.

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

Live submission is only active after the D1 database is created, the `database_id` placeholder in `wrangler.jsonc` is replaced, and the migration is applied. The gallery only reads sanitized visible observations.

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
