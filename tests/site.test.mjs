import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

test('ships an original SocoPlay.tools Diff Checker at its subpath', async () => {
  const page = await readFile(new URL('../diff-checker/index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('../assets/diff-checker.js', import.meta.url), 'utf8');
  assert.match(page, /Compare changes/);
  assert.match(page, /Original text/);
  assert.match(page, /Changed text/);
  assert.match(page, /comparison-stage/);
  assert.match(page, /hide-unchanged/);
  assert.match(script, /makeLcs/);
  assert.match(script, /first-change/);
  assert.match(script, /clipboard/);
});

test('builds a clean deployable directory instead of serving the repository root', async () => {
  await run(process.execPath, ['scripts/build.mjs']);
  await access(new URL('../dist/diff-checker/index.html', import.meta.url));
  const configuration = await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
  assert.match(configuration, /"directory": "\.\/dist"/);
});
