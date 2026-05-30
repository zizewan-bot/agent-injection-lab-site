# Deployment Notes

## Recommended Hosting

Cloudflare Pages is the recommended first hosting target because Phase 0.1 may later use Pages Functions or a Worker with D1 for validated anonymous submissions and gallery aggregation.

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

For Cloudflare Pages pure static mode, a `_redirects` file can be used for SPA fallback.

For Wrangler deploy / Workers static assets, use `wrangler.jsonc` with `assets.not_found_handling` set to `single-page-application` and do not use `_redirects`.

## Current Deployment Status

Not deployed yet.

## Phase 0.1 Backend Status

Not implemented yet.

The static Evidence Gallery currently uses sample anonymized observations. Live submissions are not enabled yet. No data is collected by the site in the current static preview.
