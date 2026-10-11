# SocoTools Diff Checker

An original, browser-only text comparison tool for `tools.socoplay.com/diff-checker`.

## Cloudflare Pages

Create a new Cloudflare Pages project from this GitHub repository and configure:

- Production branch: `main`
- Build command: `npm run build`
- Deploy command: `npm run deploy`
- Static assets directory: `dist`

Then add `tools.socoplay.com` in **Custom domains**. Cloudflare Pages serves the checker at `/diff-checker/` (and redirects `/diff-checker` there automatically).

The root directory is deliberately not deployed: it contains development dependencies. The build script copies only the public website files to `dist/` and `wrangler.jsonc` tells Cloudflare Workers to serve that directory.
