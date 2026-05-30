# Deployment Notes

## Recommended Hosting

Cloudflare Workers Static Assets through Wrangler is the current deployment mode. Phase 0.1 may later use a Worker with D1 for validated anonymous submissions and gallery aggregation.

## Static Preview Alternatives

Vercel or Netlify are also suitable for static preview hosting only.

## Build Settings

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Deploy command:

```bash
npm run deploy
```

For Cloudflare Pages pure static mode, a `_redirects` file can be used for SPA fallback.

For Wrangler deploy / Workers static assets, use `wrangler.jsonc` with `assets.not_found_handling` set to `single-page-application` and do not use `_redirects`.

This project uses Wrangler / Workers Static Assets deployment. Do not use `public/_redirects` in this deployment mode. SPA fallback is handled by `wrangler.jsonc` through `assets.not_found_handling`.

If Cloudflare deployment still fails with stale asset behavior, use "Clear build cache and deploy" in Cloudflare before retrying.

## Current Deployment Status

Not deployed yet.

## Phase 0.1 Backend Status

Backend foundation is present, but live submission requires Cloudflare D1 setup before it is active.

Required setup:

1. Create the D1 database named `agent_injection_lab_observations`.
2. Replace `TODO_D1_DATABASE_ID` in `wrangler.jsonc` with the real D1 database id.
3. Apply `migrations/0001_create_observations.sql`.
4. Deploy with Wrangler after build and migration verification.

The Evidence Gallery falls back to sample anonymized observations when the API or D1 binding is unavailable. No full evidence upload is accepted. Gallery data reads only sanitized observations where `moderation_status` is `visible`.
