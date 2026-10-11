import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

test('ships an original SocoPlay.tools Diff Checker at its subpath', async () => {
  const page = await readFile(new URL('../diff-checker/index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('../assets/diff-checker.js', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../assets/styles.css', import.meta.url), 'utf8');
  assert.match(page, /Find difference/);
  assert.match(page, /socoplay-mark\.svg/);
  assert.match(page, /google-adsense-account/);
  assert.match(page, /pagead2\.googlesyndication\.com/);
  assert.match(page, /canonical/);
  assert.match(page, /og:title/);
  assert.match(page, /application\/ld\+json/);
  assert.match(page, /WebApplication/);
  assert.match(page, /G-TXS9H43TXZ/);
  assert.match(page, /Original text/);
  assert.match(page, /Changed text/);
  assert.match(page, /comparison-stage/);
  assert.match(page, /hide-unchanged/);
  assert.match(page, /unified-layout/);
  assert.match(script, /makeLcs/);
  assert.match(script, /first-change/);
  assert.match(script, /setLayout/);
  assert.doesNotMatch(script, /workspace\.prepend/);
  assert.match(styles, /grid-template-rows:50px 32px minmax\(0,1fr\)/);
  assert.match(script, /clipboard/);
});

test('builds a clean deployable directory instead of serving the repository root', async () => {
  await run(process.execPath, ['scripts/build.mjs']);
  await access(new URL('../dist/diff-checker/index.html', import.meta.url));
  await access(new URL('../dist/assets/socoplay-mark.svg', import.meta.url));
  await access(new URL('../dist/ads.txt', import.meta.url));
  await access(new URL('../dist/robots.txt', import.meta.url));
  await access(new URL('../dist/sitemap.xml', import.meta.url));
  await access(new URL('../dist/privacy/index.html', import.meta.url));
  const adsTxt = await readFile(new URL('../ads.txt', import.meta.url), 'utf8');
  const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
  assert.match(adsTxt, /pub-5695136510723463/);
  assert.match(sitemap, /<lastmod>2026-10-11<\/lastmod>/);
  const configuration = await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
  assert.match(configuration, /"directory": "\.\/dist"/);
});
