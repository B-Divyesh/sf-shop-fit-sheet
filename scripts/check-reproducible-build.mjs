import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const workspace = resolve(import.meta.dirname, '..');
const temporaryRoot = await mkdtemp(join(tmpdir(), 'shop-fit-sheet-build-'));
const outputDirectories = [join(temporaryRoot, 'first'), join(temporaryRoot, 'second')];

async function manifest(directory) {
  const files = [];
  async function visit(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) await visit(path);
      else files.push(path);
    }
  }
  await visit(directory);
  const entries = await Promise.all(files.sort().map(async (path) => {
    const bytes = await readFile(path);
    return [relative(directory, path), createHash('sha256').update(bytes).digest('hex')];
  }));
  return Object.fromEntries(entries);
}

try {
  for (const outputDirectory of outputDirectories) {
    const result = spawnSync(resolve(workspace, 'node_modules/.bin/vite'), ['build', '--outDir', outputDirectory, '--emptyOutDir'], {
      cwd: workspace,
      encoding: 'utf8',
    });
    if (result.status !== 0) {
      process.stderr.write(result.stdout);
      process.stderr.write(result.stderr);
      throw new Error(`Independent production build failed with status ${result.status}`);
    }
  }

  const first = await manifest(outputDirectories[0]);
  const second = await manifest(outputDirectories[1]);
  if (JSON.stringify(first) !== JSON.stringify(second)) {
    const changed = [...new Set([...Object.keys(first), ...Object.keys(second)])]
      .filter((path) => first[path] !== second[path]);
    throw new Error(`Production build is not byte-reproducible: ${changed.join(', ')}`);
  }
  console.log(`Reproducible build: ${Object.keys(first).length} files matched byte-for-byte.`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
