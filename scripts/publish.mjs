// Publishes the game to GitHub Pages by hand: builds it, then replaces the gh-pages branch
// with the contents of dist/. Pages serves that branch. Run with `npm run publish:pages`.
//
// The site is published this way, rather than by the workflow in .github/workflows/deploy.yml,
// so that it does not depend on GitHub Actions being available to the account.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
const read = (command, args) => execFileSync(command, args, { encoding: 'utf8' }).trim();

if (read('git', ['status', '--porcelain'])) {
  console.error('There are uncommitted changes. Commit them first, so the published game matches a commit.');
  process.exit(1);
}
const commit = read('git', ['rev-parse', '--short', 'HEAD']);
const remote = read('git', ['remote', 'get-url', 'origin']);

run('npm', ['test']);
run('npm', ['run', 'build']);

const folder = mkdtempSync(join(tmpdir(), 'omm-pages-'));
try {
  cpSync('dist', folder, { recursive: true });
  // Tells Pages to serve the files as they are instead of running them through Jekyll.
  writeFileSync(join(folder, '.nojekyll'), '');
  run('git', ['init', '-q', '-b', 'gh-pages'], folder);
  run('git', ['add', '-A'], folder);
  run('git', ['commit', '-q', '-m', `"Publish build of ${commit}"`], folder);
  run('git', ['push', '-f', remote, 'gh-pages'], folder);
} finally {
  rmSync(folder, { recursive: true, force: true });
}
console.log(`Published ${commit}. It can take a minute to appear.`);
