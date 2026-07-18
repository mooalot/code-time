// Tests for lesson selection: no repeats across mixes, reviews don't crowd out
// fresh material. Run: node --test tests/state.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';

// shim localStorage before importing state.js (it reads at module load)
const store = {};
globalThis.localStorage = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
const S = await import('../js/state.js');

const makeQs = (prefix, n) => Array.from({ length: n }, (_, i) => ({ id: `${prefix}${i}`, tier: 1 }));

test('pickLesson returns n unique questions', () => {
  S.resetAll();
  const lesson = S.pickLesson(makeQs('q', 50), 8);
  assert.equal(lesson.length, 8);
  assert.equal(new Set(lesson.map((q) => q.id)).size, 8, 'no dupes within a lesson');
});

test('exclude prevents recently-served questions from repeating', () => {
  S.resetAll();
  const pool = makeQs('q', 50);
  const first = S.pickLesson(pool, 8, { exclude: S.recentServedSet() });
  S.noteServed(first.map((q) => q.id));
  const second = S.pickLesson(pool, 8, { exclude: S.recentServedSet() });
  S.noteServed(second.map((q) => q.id));
  const overlap = second.filter((q) => first.some((f) => f.id === q.id));
  assert.equal(overlap.length, 0, 'consecutive mixes share no questions');
});

test('exclude relaxes when the pool is too small to fill a lesson', () => {
  S.resetAll();
  const pool = makeQs('q', 8);
  S.noteServed(pool.map((q) => q.id)); // "recently served" everything
  const lesson = S.pickLesson(pool, 8, { exclude: S.recentServedSet() });
  assert.equal(lesson.length, 8, 'still fills the lesson from the full pool');
});

test('reviewCap reserves slots for fresh material in the mix', () => {
  S.resetAll();
  let now = 1_700_000_000_000;
  S.__setClock(() => new Date(now));
  const dueQs = makeQs('d', 12);
  for (const q of dueQs) S.recordAnswer(q.id, 1, false); // wrong → box 0, due in 10 min
  const unseenQs = makeQs('u', 8);
  now += 11 * 60 * 1000; // advance past the 10-min interval → dueQs are now due
  const lesson = S.pickLesson([...dueQs, ...unseenQs], 8, { reviewCap: 4 });
  const dueIds = new Set(dueQs.map((q) => q.id));
  const reviews = lesson.filter((q) => dueIds.has(q.id)).length;
  const fresh = lesson.filter((q) => !dueIds.has(q.id)).length;
  assert.ok(reviews <= 4, `reviews capped at 4, got ${reviews}`);
  assert.ok(fresh >= 4, `fresh material reserved, got ${fresh}`);
  S.__setClock(() => new Date());
});

test('default reviewCap = n keeps Review-due lessons all-due', () => {
  S.resetAll();
  let now = 1_700_000_000_000;
  S.__setClock(() => new Date(now));
  const dueQs = makeQs('d', 20);
  for (const q of dueQs) S.recordAnswer(q.id, 1, false);
  now += 11 * 60 * 1000;
  const lesson = S.pickLesson(dueQs, 8); // no opts → no cap
  assert.equal(lesson.length, 8);
  S.__setClock(() => new Date());
});
