import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('ships an original SocoTools Diff Checker at its subpath', async () => {
  const page = await readFile(new URL('../diff-checker/index.html', import.meta.url), 'utf8');
  const script = await readFile(new URL('../assets/diff-checker.js', import.meta.url), 'utf8');
  assert.match(page, /SocoTools Diff Checker/);
  assert.match(page, /Original/);
  assert.match(page, /Revised/);
  assert.match(script, /makeLcs/);
  assert.match(script, /clipboard/);
});
