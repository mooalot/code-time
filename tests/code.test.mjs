// Unit tests for the syntax highlighter (pure, no DOM). Run: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { highlight } from '../js/code.js';

test('keywords are wrapped', () => {
  const out = highlight('const x = 1;', 'js');
  assert.match(out, /<span class="tok-kw">const<\/span>/);
});

test('strings are wrapped and escaped', () => {
  const out = highlight('const s = "<b>";', 'js');
  assert.match(out, /tok-str/);
  assert.match(out, /&lt;b&gt;/); // HTML inside the string is escaped
  assert.doesNotMatch(out, /<b>/); // never emit a raw tag
});

test('line comments are wrapped', () => {
  const out = highlight('x = 1 // note', 'js');
  assert.match(out, /<span class="tok-com">\/\/ note<\/span>/);
});

test('python hash comments and keywords', () => {
  const out = highlight('def f(): # hi', 'py');
  assert.match(out, /tok-kw">def</);
  assert.match(out, /tok-com">.*hi</);
});

test('numbers are wrapped', () => {
  const out = highlight('let n = 42', 'js');
  assert.match(out, /<span class="tok-num">42<\/span>/);
});

test('keyword inside a string is NOT highlighted as a keyword', () => {
  const out = highlight('const s = "const"', 'js');
  // the literal word const inside the string stays inside the string span
  assert.match(out, /tok-str">"const"<\/span>/);
  assert.doesNotMatch(out.split('s = ')[1], /tok-kw/); // not re-flagged as a keyword
});

test('sql keywords are case-insensitive', () => {
  const out = highlight('select * from users', 'sql');
  assert.match(out, /tok-kw">select</);
  assert.match(out, /tok-kw">from</);
});

test('angle brackets in plain code are escaped', () => {
  const out = highlight('a < b && c > d', 'js');
  assert.match(out, /a &lt; b/);
  assert.match(out, /c &gt; d/);
});
