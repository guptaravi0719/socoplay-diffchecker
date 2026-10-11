# SocoTools Diff Checker

An original, browser-only text comparison tool for `tools.socoplay.com/diff-checker`.

## Cloudflare Pages

Create a new Cloudflare Pages project from this GitHub repository and configure:

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `.`

Then add `tools.socoplay.com` in **Custom domains**. Cloudflare Pages serves the checker at `/diff-checker/` (and redirects `/diff-checker` there automatically).
