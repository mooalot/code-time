// Question player: renders one question, collects the answer, grades it.
// Four types: mc, predict (free-text output), dsa (self-graded drill),
// flashcard (self-graded open prompt).
import { shuffle } from './state.js';
import { codeBlock } from './code.js';

// Inline prose: `code`, **bold**, *italic*, with HTML escaped first.
export function proseHTML(text) {
  let s = escapeHTML(text || '');
  s = s.replace(/`([^`]+)`/g, (_, c) => `<code class="inline">${c}</code>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  s = s.replace(/\*([^*\s][^*]*)\*/g, '<i>$1</i>');
  return s;
}

function escapeHTML(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

const TIER_NAMES = { 1: 'warm-up', 2: 'core', 3: 'stretch' };
const TYPE_LABEL = { mc: 'multiple choice', predict: 'predict output', dsa: 'algorithm', flashcard: 'flashcard' };

// Renders `q` into `container`. Calls `onAnswered(correct)` once graded.
// Returns { check, selfGraded }. For selfGraded questions the card owns its own
// reveal + self-rating controls; the lesson's primary button waits for onAnswered.
export function renderQuestion(container, q, onAnswered) {
  container.innerHTML = '';
  const card = el('div', 'qcard');
  container.appendChild(card);

  const meta = el('div', 'q-meta');
  meta.appendChild(el('span', `tier-badge tier-${q.tier}`, TIER_NAMES[q.tier] || ''));
  meta.appendChild(el('span', 'type-badge', TYPE_LABEL[q.type] || q.type));
  card.appendChild(meta);

  card.appendChild(el('div', 'prompt', proseHTML(q.prompt)));

  if (q.code) card.appendChild(codeBlock(q.code, q.lang || 'js'));

  const inputArea = el('div', 'input-area');
  card.appendChild(inputArea);

  const selfGraded = q.type === 'dsa' || q.type === 'flashcard';

  if (q.type === 'mc') return { selfGraded: false, check: buildGraded(card, inputArea, q, onAnswered, buildMC) };
  if (q.type === 'predict') return { selfGraded: false, check: buildGraded(card, inputArea, q, onAnswered, buildPredict) };
  if (selfGraded) return { selfGraded: true, check: buildSelfGraded(card, inputArea, q, onAnswered) };

  inputArea.textContent = `Unknown question type: ${q.type}`;
  return { selfGraded: false, check: () => 'answered' };
}

// --- auto-graded shell (mc, predict) ---------------------------------------
function buildGraded(card, inputArea, q, onAnswered, builder) {
  const { getAnswer, lockInputs } = builder(inputArea, q);
  let answered = false;
  return function check() {
    if (answered) return 'answered';
    const res = getAnswer();
    if (!res) return null;
    answered = true;
    lockInputs(res);
    showFeedback(card, q, res);
    onAnswered(res.correct);
    return res.correct;
  };
}

function showFeedback(card, q, res) {
  const fb = el('div', `feedback ${res.correct ? 'good' : 'bad'}`);
  fb.appendChild(el('div', 'feedback-title', res.correct ? pick(PRAISE) : pick(ENCOURAGE)));
  if (!res.correct && res.correctText) {
    fb.appendChild(el('div', 'correct-answer', `Answer: ${res.correctText}`));
  }
  if (q.explanation) fb.appendChild(el('div', 'explanation', proseHTML(q.explanation)));
  card.appendChild(fb);
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

const PRAISE = ['Nailed it. ✅', 'Correct!', 'Clean.', 'Exactly right.', 'Ship it. 🚀', 'That compiles. ✅'];
const ENCOURAGE = ['Not quite.', "Let's debug that.", 'Off by one.', 'Not this time.', 'Close — read the answer.'];
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

// --- multiple choice --------------------------------------------------------
function buildMC(area, q) {
  const order = shuffle(q.choices.map((_, i) => i));
  let selected = null;
  const buttons = order.map((origIdx, i) => {
    const b = el('button', 'choice');
    b.innerHTML = `<span class="choice-key">${i + 1}</span><span class="choice-body">${proseHTML(q.choices[origIdx])}</span>`;
    b.dataset.orig = origIdx;
    b.addEventListener('click', () => {
      if (b.disabled) return;
      selected = origIdx;
      buttons.forEach((x) => x.classList.toggle('selected', x === b));
    });
    area.appendChild(b);
    return b;
  });

  const keyHandler = (e) => {
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= buttons.length && !buttons[0].disabled) buttons[n - 1].click();
  };
  document.addEventListener('keydown', keyHandler);

  return {
    getAnswer() {
      if (selected == null) return null;
      return { correct: selected === q.answer, correctText: stripMd(q.choices[q.answer]) };
    },
    lockInputs() {
      document.removeEventListener('keydown', keyHandler);
      buttons.forEach((b) => {
        b.disabled = true;
        const orig = parseInt(b.dataset.orig, 10);
        if (orig === q.answer) b.classList.add('reveal-correct');
        else if (orig === selected) b.classList.add('reveal-wrong');
      });
    },
  };
}

// --- predict the output -----------------------------------------------------
function buildPredict(area, q) {
  const accepted = (q.answers || [q.answer]).map(String);
  const wrap = el('div', 'predict-wrap');
  const input = el('input', 'predict-input');
  input.type = 'text';
  input.placeholder = q.placeholder || 'what does it print / return?';
  input.autocomplete = 'off';
  input.spellcheck = false;
  wrap.appendChild(input);
  area.appendChild(wrap);
  setTimeout(() => input.focus(), 0);

  return {
    getAnswer() {
      if (input.value.trim() === '') return null;
      const got = norm(input.value);
      const correct = accepted.some((a) => norm(a) === got);
      return { correct, correctText: accepted[0] };
    },
    lockInputs(res) {
      input.disabled = true;
      wrap.classList.add(res.correct ? 'good' : 'bad');
    },
  };
}

// normalize a predicted output: trim, collapse inner whitespace, strip a
// single layer of matching surrounding quotes so 'foo' == foo == "foo".
function norm(s) {
  let t = String(s).trim().replace(/\s+/g, ' ');
  t = t.replace(/^['"`](.*)['"`]$/s, '$1');
  return t;
}

function stripMd(s) {
  return String(s).replace(/[`*]/g, '');
}

// --- self-graded (dsa, flashcard) ------------------------------------------
function buildSelfGraded(card, inputArea, q, onAnswered) {
  if (q.type === 'flashcard') {
    inputArea.appendChild(el('div', 'self-hint', 'Think it through out loud, then reveal the model answer.'));
  } else {
    inputArea.appendChild(el('div', 'self-hint', 'Sketch your approach + complexity, then reveal to check yourself.'));
  }

  const reveal = el('button', 'btn reveal-btn', 'Reveal answer');
  inputArea.appendChild(reveal);

  let answered = false;
  reveal.addEventListener('click', () => {
    if (answered) return;
    reveal.remove();
    card.appendChild(renderReveal(q));

    const rate = el('div', 'self-rate');
    rate.appendChild(el('div', 'self-rate-q', 'How did you do?'));
    const btns = el('div', 'self-rate-btns');
    const miss = el('button', 'btn rate-miss', "✗ Missed it");
    const got = el('button', 'btn rate-got', '✓ Got it');
    btns.append(miss, got);
    rate.appendChild(btns);
    card.appendChild(rate);
    rate.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const finish = (correct) => {
      if (answered) return;
      answered = true;
      miss.disabled = got.disabled = true;
      (correct ? got : miss).classList.add('chosen');
      onAnswered(correct);
    };
    miss.addEventListener('click', () => finish(false));
    got.addEventListener('click', () => finish(true));
    got.focus();
  });

  // The primary lesson button is hidden while selfGraded && unanswered; this
  // check() is only wired for the Enter key convenience.
  return function check() {
    if (!answered) { reveal.click(); return 'revealed'; }
    return 'answered';
  };
}

function renderReveal(q) {
  const box = el('div', 'reveal-box');
  const r = q.reveal || {};
  if (q.type === 'dsa') {
    if (r.approach) {
      box.appendChild(el('div', 'reveal-h', 'Approach'));
      box.appendChild(el('div', 'reveal-body', proseHTML(r.approach)));
    }
    if (r.code) box.appendChild(codeBlock(r.code, r.lang || q.lang || 'js'));
    if (r.complexity) {
      box.appendChild(el('div', 'reveal-h', 'Complexity'));
      box.appendChild(el('div', 'reveal-body', proseHTML(r.complexity)));
    }
    if (r.insight) {
      box.appendChild(el('div', 'reveal-h', 'Key insight'));
      box.appendChild(el('div', 'reveal-body', proseHTML(r.insight)));
    }
    if (r.link) {
      const a = el('a', 'reveal-link');
      a.href = r.link; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = 'Practice this pattern →';
      box.appendChild(a);
    }
  } else { // flashcard
    if (r.answer) {
      box.appendChild(el('div', 'reveal-h', 'Model answer'));
      box.appendChild(el('div', 'reveal-body', proseHTML(r.answer)));
    }
    if (Array.isArray(r.points) && r.points.length) {
      box.appendChild(el('div', 'reveal-h', 'Hit these points'));
      const ul = el('ul', 'reveal-list');
      r.points.forEach((p) => ul.appendChild(el('li', null, proseHTML(p))));
      box.appendChild(ul);
    }
    if (r.trap) {
      box.appendChild(el('div', 'reveal-h', 'Common trap'));
      box.appendChild(el('div', 'reveal-body', proseHTML(r.trap)));
    }
  }
  return box;
}
