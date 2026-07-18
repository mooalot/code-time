// Tiny dependency-free syntax highlighter. Good enough for interview snippets:
// tokenizes comments, strings, numbers, and a keyword set per language, and
// wraps each in a <span class="tok-*">. Not a real parser — deliberately small.
//
// Single left-to-right pass: carve out comments/strings first (they can contain
// anything), and highlight keywords/numbers only in the gaps. Classification
// happens on raw text; HTML is emitted (and escaped) at the very end, so the
// regexes never run over markup they just produced.

const KEYWORDS = {
  js: 'await async break case catch class const continue debugger default delete do else export extends finally for from function get if import in instanceof let new of return set static super switch this throw try typeof var void while yield true false null undefined NaN',
  ts: 'await async break case catch class const continue declare default delete do else enum export extends finally for from function get if implements import in infer instanceof interface keyof let namespace new of private protected public readonly return set static super switch this throw try type typeof var void while yield as satisfies true false null undefined never unknown any string number boolean',
  py: 'and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield True False None self print len range',
  ruby: 'def end module class if elsif else unless while until for do begin rescue ensure return yield then case when break next redo retry self nil true false and or not in puts require attr_accessor new',
  elixir: 'def defp defmodule do end fn if else unless cond case when with for in receive after try rescue catch raise import alias require use nil true false and or not defstruct defmacro',
  go: 'break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var nil true false make new len cap append string int error',
  sql: 'SELECT FROM WHERE JOIN LEFT RIGHT INNER OUTER FULL ON GROUP BY ORDER HAVING LIMIT OFFSET INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE ALTER DROP INDEX PRIMARY KEY FOREIGN REFERENCES NOT NULL AS DISTINCT COUNT SUM AVG MIN MAX AND OR IN EXISTS UNION WITH CASE WHEN THEN ELSE END DESC ASC IS OVER PARTITION',
};
KEYWORDS.jsx = KEYWORDS.js;
KEYWORDS.tsx = KEYWORDS.ts;
KEYWORDS.python = KEYWORDS.py;
KEYWORDS.rb = KEYWORDS.ruby;
KEYWORDS.ex = KEYWORDS.elixir;
KEYWORDS.golang = KEYWORDS.go;

const COMMENT_SRC = {
  js: '\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/',
  py: '#.*',
  ruby: '#.*',
  elixir: '#.*',
  sql: '--.*|\\/\\*[\\s\\S]*?\\*\\/',
};
COMMENT_SRC.ts = COMMENT_SRC.js;
COMMENT_SRC.jsx = COMMENT_SRC.js;
COMMENT_SRC.tsx = COMMENT_SRC.js;
COMMENT_SRC.go = COMMENT_SRC.js;
COMMENT_SRC.golang = COMMENT_SRC.js;
COMMENT_SRC.python = COMMENT_SRC.py;
COMMENT_SRC.rb = COMMENT_SRC.ruby;
COMMENT_SRC.ex = COMMENT_SRC.elixir;

const STRING_SRC = "`(?:\\\\.|[^`\\\\])*`|\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*'";

function escapeHTML(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function highlight(code, lang = 'js') {
  const key = lang.toLowerCase();
  const kw = new Set((KEYWORDS[key] || KEYWORDS.js).split(/\s+/));
  const isSql = key === 'sql';

  // highlight a run of plain code (no strings/comments) by tokenizing raw text
  const plain = (text) => {
    let out = '';
    const re = /([A-Za-z_$][A-Za-z0-9_$]*)|(\d[\d_.]*)|([\s\S])/g;
    let m;
    while ((m = re.exec(text))) {
      if (m[1]) {
        const w = m[1];
        if (kw.has(w) || (isSql && kw.has(w.toUpperCase()))) out += `<span class="tok-kw">${w}</span>`;
        else out += w; // identifiers have no HTML-special chars
      } else if (m[2]) {
        out += `<span class="tok-num">${m[2]}</span>`;
      } else {
        out += escapeHTML(m[3]); // single char: escapes <, >, &
      }
    }
    return out;
  };

  const commentSrc = COMMENT_SRC[key] || COMMENT_SRC.js;
  const master = new RegExp(`${STRING_SRC}|${commentSrc}`, 'g');

  let out = '';
  let last = 0;
  let m;
  while ((m = master.exec(code))) {
    out += plain(code.slice(last, m.index));
    const tok = m[0];
    const cls = (tok[0] === '"' || tok[0] === "'" || tok[0] === '`') ? 'str' : 'com';
    out += `<span class="tok-${cls}">${escapeHTML(tok)}</span>`;
    last = m.index + tok.length;
  }
  out += plain(code.slice(last));
  return out;
}

// Build a <pre class="code"> block element for a question.
export function codeBlock(code, lang = 'js') {
  const pre = document.createElement('pre');
  pre.className = 'code';
  pre.dataset.lang = lang;
  const c = document.createElement('code');
  c.innerHTML = highlight(code, lang);
  pre.appendChild(c);
  return pre;
}
