// Validates every data/questions/<topic>.json against the authoring spec.
// Run: node tools/validate.js
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const qDir = join(root, 'data', 'questions');

// topic ids + prefixes must stay in sync with js/topics.js and QUESTIONS.md
const PREFIX = {
  'js-core': 'jsc', 'async-js': 'asy', 'typescript': 'ts', 'react': 'rct',
  'frontend-css': 'css', 'web-platform': 'web', 'dsa-arrays': 'arr',
  'dsa-graphs': 'grp', 'complexity': 'cpx', 'implement': 'impl',
  'practical': 'prc', 'testing': 'test', 'system-design': 'sys',
  'sql': 'sql', 'postgres': 'pg', 'rails': 'rb', 'elixir': 'elx', 'go-python': 'gop',
  'ai-llm': 'ai', 'behavioral': 'beh',
};
const TYPES = new Set(['mc', 'predict', 'dsa', 'flashcard']);
const LANGS = new Set(['js', 'ts', 'jsx', 'tsx', 'py', 'python', 'ruby', 'rb', 'elixir', 'ex', 'go', 'golang', 'sql', 'css', 'html', 'json', 'bash', 'text']);

let errors = 0;
let count = 0;
const seenIds = new Set();
const byTopic = {};

function err(file, id, msg) {
  console.error(`  ✗ [${file}${id ? ' ' + id : ''}] ${msg}`);
  errors++;
}

const files = readdirSync(qDir).filter((f) => f.endsWith('.json'));

for (const file of files) {
  const topic = file.replace(/\.json$/, '');
  if (!PREFIX[topic]) { err(file, '', `unknown topic id (not in PREFIX map)`); continue; }
  let arr;
  try {
    arr = JSON.parse(readFileSync(join(qDir, file), 'utf8'));
  } catch (e) {
    err(file, '', `invalid JSON: ${e.message}`);
    continue;
  }
  if (!Array.isArray(arr)) { err(file, '', 'file must be a JSON array'); continue; }
  byTopic[topic] = arr.length;

  for (const q of arr) {
    count++;
    const id = q.id || '(no id)';
    if (!q.id || !q.id.startsWith(PREFIX[topic] + '-')) err(file, id, `id must start with "${PREFIX[topic]}-"`);
    if (seenIds.has(q.id)) err(file, id, 'duplicate id');
    seenIds.add(q.id);
    if (q.topic !== topic) err(file, id, `topic "${q.topic}" != "${topic}"`);
    if (![1, 2, 3].includes(q.tier)) err(file, id, `tier must be 1|2|3`);
    if (!TYPES.has(q.type)) err(file, id, `bad type "${q.type}"`);
    if (typeof q.prompt !== 'string' || !q.prompt.trim()) err(file, id, 'missing prompt');
    if (q.code != null && typeof q.code !== 'string') err(file, id, 'code must be a string');
    if (q.lang != null && !LANGS.has(String(q.lang).toLowerCase())) err(file, id, `unknown lang "${q.lang}"`);

    if (q.type === 'mc') {
      if (!Array.isArray(q.choices) || q.choices.length < 3 || q.choices.length > 5) err(file, id, 'mc needs 3–5 choices');
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.choices?.length ?? 0)) err(file, id, 'mc answer index out of range');
      if (!q.explanation) err(file, id, 'mc needs explanation');
    } else if (q.type === 'predict') {
      const ans = q.answers || (q.answer != null ? [q.answer] : null);
      if (!Array.isArray(ans) || !ans.length) err(file, id, 'predict needs answers[]');
      if (!q.code) err(file, id, 'predict needs code');
      if (!q.explanation) err(file, id, 'predict needs explanation');
    } else if (q.type === 'dsa') {
      const r = q.reveal || {};
      if (!r.approach) err(file, id, 'dsa reveal needs approach');
      if (!r.complexity) err(file, id, 'dsa reveal needs complexity');
    } else if (q.type === 'flashcard') {
      const r = q.reveal || {};
      if (!r.answer && !(Array.isArray(r.points) && r.points.length)) err(file, id, 'flashcard reveal needs answer or points[]');
    }
  }
}

console.log('\nPer topic:');
for (const t of Object.keys(PREFIX)) {
  const n = byTopic[t];
  console.log(`  ${n == null ? '—  (missing)' : String(n).padStart(3)}  ${t}`);
}
console.log(`\n${count} questions, ${errors} error(s).`);
process.exit(errors ? 1 : 0);
