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

Cloudflare Pages SPA fallback is provided by `public/_redirects`. Vite copies this file to `dist/_redirects` during build so direct refreshes on nested React routes resolve to `index.html`.

## Current Deployment Status

Not deployed yet.

## Phase 0.1 Backend Status

Not implemented yet.

The static Evidence Gallery currently uses sample anonymized observations. Live submissions are not enabled yet. No data is collected by the site in the current static preview.
