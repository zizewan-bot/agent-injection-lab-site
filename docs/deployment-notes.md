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

Deployed as a public preview through Cloudflare Workers Static Assets.

## Phase 0.1 Backend Status

Phase 0.1 live submission is active after Cloudflare D1 setup, migration application, and Worker deployment.

Production setup:

1. D1 database `agent_injection_lab_observations` is bound as `DB`.
2. Apply any new migrations before deploying Worker changes that depend on them.
3. Deploy with Wrangler after build, test, and migration verification.

The Evidence Gallery falls back to sample anonymized observations when the API or D1 binding is unavailable. No full evidence upload is accepted. Gallery data reads only sanitized observations where `moderation_status` is `visible`.
