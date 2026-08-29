import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const releaseScript = resolve(import.meta.dirname, 'verify-release.mjs');

function run(command, args, cwd) {
  return spawnSync(command, args, { cwd, encoding: 'utf8' });
}

function git(args, cwd) {
  const result = run('git', args, cwd);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

test('release guard rejects missing and unpushed candidates', () => {
  const root = mkdtempSync(join(tmpdir(), 'shop-fit-sheet-release-'));
  const remote = join(root, 'remote.git');
  const repository = join(root, 'repository');

  try {
    git(['init', '--bare', remote], root);
    git(['init', '--initial-branch=main', repository], root);
    git(['config', 'user.name', 'Release test'], repository);
    git(['config', 'user.email', 'release-test@example.invalid'], repository);
    writeFileSync(join(repository, 'artifact.txt'), 'first release\n');
    git(['add', 'artifact.txt'], repository);
    git(['commit', '-m', 'first release'], repository);
    git(['remote', 'add', 'origin', remote], repository);
    git(['push', '--set-upstream', 'origin', 'main'], repository);

    const published = run(process.execPath, [releaseScript], repository);
    assert.equal(published.status, 0, published.stderr);
    assert.match(published.stdout, /"clean":true/);

    writeFileSync(join(repository, 'artifact.txt'), 'second release\n');
    git(['add', 'artifact.txt'], repository);
    git(['commit', '-m', 'second release'], repository);
    const unpushed = run(process.execPath, [releaseScript], repository);
    assert.equal(unpushed.status, 1);
    assert.match(unpushed.stderr, /is not the commit advertised by origin\/main/);

    const missing = run(process.execPath, [releaseScript, '--candidate', 'edee5375d180b11ea6168b4d15a36ed3e9963bd8'], repository);
    assert.equal(missing.status, 1);
    assert.match(missing.stderr, /does not resolve to a local commit/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
