import { execFileSync } from 'node:child_process';

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

const candidate = argument('candidate', 'HEAD');
const remote = argument('remote', 'origin');
const branch = argument('branch', 'main');

try {
  const status = git(['status', '--porcelain', '--untracked-files=all']);
  if (status) throw new Error('the worktree is not clean');

  let candidateSha;
  try {
    candidateSha = git(['rev-parse', '--verify', `${candidate}^{commit}`]);
  } catch {
    throw new Error(`candidate ${candidate} does not resolve to a local commit`);
  }

  git(['fetch', '--quiet', '--no-tags', remote, branch]);
  const remoteSha = git(['rev-parse', '--verify', `refs/remotes/${remote}/${branch}^{commit}`]);
  const advertised = git(['ls-remote', '--exit-code', remote, `refs/heads/${branch}`]).split(/\s+/)[0];
  if (candidateSha !== remoteSha || candidateSha !== advertised) {
    throw new Error(`candidate ${candidateSha} is not the commit advertised by ${remote}/${branch} (${advertised})`);
  }

  console.log(JSON.stringify({ candidate: candidateSha, remote: `${remote}/${branch}`, advertised, clean: true }));
} catch (error) {
  console.error(`Release identity check failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
