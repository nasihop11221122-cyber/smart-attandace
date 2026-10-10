// Finds imports whose upper/lower case does not match the real file name.
// Windows does not care about case, but Vercel (Linux) does, so such an import breaks the deploy.
// Run from the folder that has the code:   node scripts/check-imports.mjs src
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = path.resolve(process.argv[2] || 'src');
const EXT = ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.css'];

// Exact file names: from git when possible (this is what Vercel gets), else from the disk
const tracked = new Set();
let usingGit = false;
let gitTop = '';
try {
  const top = execSync('git rev-parse --show-toplevel', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .trim();
  const files = execSync('git ls-files', { cwd: top, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 26 })
    .toString()
    .split('\n')
    .filter(Boolean);
  files.forEach((f) => tracked.add(path.resolve(top, f)));
  usingGit = tracked.size > 0;
  gitTop = path.resolve(top);
} catch {
  /* not a git repo */
}

const dirNames = new Map();
const namesIn = (dir) => {
  if (dirNames.has(dir)) return dirNames.get(dir);
  let names = [];
  if (usingGit) {
    const prefix = dir + path.sep;
    const set = new Set();
    for (const f of tracked) if (f.startsWith(prefix)) set.add(f.slice(prefix.length).split(path.sep)[0]);
    names = [...set];
  } else if (fs.existsSync(dir)) {
    names = fs.readdirSync(dir);
  }
  dirNames.set(dir, names);
  return names;
};

// Walks the path one part at a time and compares the exact spelling
const spellingProblem = (fromDir, spec) => {
  const target = path.resolve(fromDir, spec);
  const top = usingGit && target.startsWith(gitTop + path.sep) ? gitTop : path.parse(target).root;
  const parts = path.relative(top, target).split(path.sep);
  let current = top;
  for (const part of parts) {
    const names = namesIn(current);
    if (names.includes(part)) {
      current = path.join(current, part);
      continue;
    }
    const lower = names.find((n) => n.toLowerCase() === part.toLowerCase());
    if (lower) return { wrote: part, real: lower };
    return null; // missing file: not a case problem
  }
  return null;
};

const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(js|jsx|mjs|cjs|ts|tsx)$/.test(entry.name)) files.push(full);
  }
};
walk(root);

const IMPORT_RE = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

let problems = 0;
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(IMPORT_RE)) {
    const spec = m[1] || m[2] || m[3];
    if (!spec || !spec.startsWith('.')) continue;
    const hasExt = EXT.includes(path.extname(spec));
    const candidates = hasExt ? [spec] : [spec, ...EXT.map((e) => spec + e), ...EXT.map((e) => `${spec}/index${e}`)];
    const dir = path.dirname(file);
    const bad = candidates.map((c) => spellingProblem(dir, c)).find(Boolean);
    const exists = candidates.some((c) => {
      const p = path.resolve(dir, c);
      return usingGit ? tracked.has(p) : fs.existsSync(p) && fs.statSync(p).isFile();
    });
    if (bad && !exists) {
      problems += 1;
      console.log(`${path.relative(process.cwd(), file)}\n   import '${spec}'  ->  "${bad.wrote}" should be "${bad.real}"`);
    }
  }
}

console.log(problems === 0 ? 'No case problems found.' : `\n${problems} problem(s) found. Fix the import so it matches the file name exactly.`);
process.exit(problems === 0 ? 0 : 1);