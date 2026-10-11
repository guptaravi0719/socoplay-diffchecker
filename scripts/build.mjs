import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
const staticEntries = ['index.html', '_redirects', 'assets', 'diff-checker'];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await Promise.all(staticEntries.map((entry) => cp(resolve(root, entry), resolve(output, entry), { recursive: true })));

console.log(`Prepared ${staticEntries.length} static entries in dist/`);
