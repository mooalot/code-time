// App shell: loads the question bank, renders screens, runs lessons.
import { TOPICS, COMPANIES, COMPANY_BY_ID, topicsForCompany } from './topics.js';
import * as S from './state.js';
import { renderQuestion } from './question.js';

const LESSON_SIZE = 8;
const screen = document.getElementById('screen');

const bank = { byTopic: {}, all: [] };

async function loadBank() {
  const results = await Promise.all(
    TOPICS.map(async (t) => {
      try {
        const res = await fetch(`data/questions/${t.id}.json`);
        if (!res.ok) return [];
        return await res.json();
      } catch (e) {
        return [];
      }
    })
  );
  TOPICS.forEach((t, i) => {
    bank.byTopic[t.id] = results[i];
    bank.all.push(...results[i]);
  });
}

function updateHeader() {
  const st = S.getState();
  document.querySelector('#stat-streak b').textContent = S.currentStreak();
  document.getElementById('stat-streak').classList.toggle('lit', S.streakSavedToday());
  document.querySelector('#stat-xp b').textContent = st.xp;
  document.querySelector('#stat-level b').textContent = S.levelInfo().level;
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

const focusCompany = () => S.getSetting('company') || 'all';
const visibleTopics = () => topicsForCompany(focusCompany());
const poolForTopics = (topics) => {
  const ids = new Set(topics.map((t) => t.id));
  return bank.all.filter((q) => ids.has(q.topic));
};

// --------------------------------------------------------------------------
// Home screen
// --------------------------------------------------------------------------
function showHome() {
  updateHeader();
  screen.innerHTML = '';
  const st = S.getState();
  const topics = visibleTopics();
  const pool = poolForTopics(topics);
  const dueAll = S.dueCount(pool.map((q) => q.id));

  // hero: streak nudge + start buttons
  const hero = el('div', 'hero');
  const streak = S.currentStreak();
  const saved = S.streakSavedToday();
  hero.appendChild(
    el(
      'div',
      'hero-text',
      streak === 0
        ? '<b>Start a streak today.</b> One set a day and the interview stops being scary.'
        : saved
          ? `🔥 <b>${streak}-day streak</b> — today is banked. Keep grinding.`
          : `🔥 <b>${streak}-day streak</b> — finish a set today to keep it alive!`
    )
  );
  const heroBtns = el('div', 'hero-buttons');
  const mixBtn = el('button', 'btn primary', '🎲 Daily Mix');
  mixBtn.addEventListener('click', () => startLesson(null));
  heroBtns.appendChild(mixBtn);
  if (dueAll > 0) {
    const revBtn = el('button', 'btn review', `⏰ Review due (${dueAll})`);
    revBtn.addEventListener('click', () => startLesson('due'));
    heroBtns.appendChild(revBtn);
  }
  hero.appendChild(heroBtns);
  screen.appendChild(hero);

  // company focus selector
  const focusRow = el('div', 'focus-row');
  const label = el('label', 'focus-label', 'Focus');
  label.htmlFor = 'company-select';
  const sel = el('select', 'company-select');
  sel.id = 'company-select';
  sel.appendChild(new Option('All companies', 'all', false, focusCompany() === 'all'));
  for (const c of COMPANIES) {
    sel.appendChild(new Option(c.name, c.id, false, focusCompany() === c.id));
  }
  sel.addEventListener('change', () => {
    S.setSetting('company', sel.value);
    showHome();
  });
  focusRow.append(label, sel);
  screen.appendChild(focusRow);

  const active = COMPANY_BY_ID[focusCompany()];
  if (active) {
    screen.appendChild(el('div', 'company-note', `<b>${active.name}.</b> ${active.blurb}`));
  }

  // topic grid
  const grid = el('div', 'topic-grid');
  for (const t of topics) {
    const qs = bank.byTopic[t.id] || [];
    const ids = qs.map((q) => q.id);
    const mastery = S.topicMastery(ids);
    const due = S.dueCount(ids);
    const card = el('button', 'topic-card');
    card.innerHTML = `
      <div class="topic-icon">${t.icon}</div>
      <div class="topic-body">
        <div class="topic-title">${t.title}${due ? ` <span class="due-pill">${due} due</span>` : ''}</div>
        <div class="topic-blurb">${t.blurb}</div>
        <div class="mastery-bar"><div class="mastery-fill" style="width:${Math.round(mastery * 100)}%"></div></div>
        <div class="topic-meta">${qs.length} questions · ${Math.round(mastery * 100)}% mastered</div>
      </div>`;
    if (!qs.length) card.classList.add('empty');
    else card.addEventListener('click', () => startLesson(t.id));
    grid.appendChild(card);
  }
  screen.appendChild(grid);

  // footer stats + reset
  const foot = el('div', 'home-foot');
  const acc = st.totalAnswered ? Math.round((100 * st.totalCorrect) / st.totalAnswered) : 0;
  foot.appendChild(
    el(
      'div',
      'foot-stats',
      `${st.totalAnswered} answered · ${acc}% accuracy · best streak ${st.bestStreak} · ${bank.all.length} questions in the bank`
    )
  );
  const reset = el('button', 'btn subtle', 'Reset progress');
  reset.addEventListener('click', () => {
    if (confirm('Erase all XP, streak and review history?')) {
      S.resetAll();
      showHome();
    }
  });
  foot.appendChild(reset);
  screen.appendChild(foot);
}

// --------------------------------------------------------------------------
// Lesson screen
// --------------------------------------------------------------------------
function startLesson(topicId) {
  let pool;
  let title;
  if (topicId === 'due') {
    pool = poolForTopics(visibleTopics()).filter((q) => S.isDue(q.id));
    title = 'Review';
  } else if (topicId) {
    pool = bank.byTopic[topicId] || [];
    title = TOPICS.find((t) => t.id === topicId)?.title || topicId;
  } else {
    pool = poolForTopics(visibleTopics());
    title = 'Daily Mix';
  }
  const active = COMPANY_BY_ID[focusCompany()];
  if (active && topicId !== 'due') title += ` · ${active.name}`;
  if (!pool.length) return;
  // Review pulls all-due; other lessons reserve half the slots for fresh
  // material and skip what was just served so mixes stop repeating.
  const questions = S.pickLesson(pool, LESSON_SIZE, {
    exclude: S.recentServedSet(),
    reviewCap: topicId === 'due' ? LESSON_SIZE : Math.ceil(LESSON_SIZE / 2),
  });
  S.noteServed(questions.map((q) => q.id));
  runLesson(questions, title);
}

function runLesson(questions, title) {
  let idx = 0;
  let correctCount = 0;
  let xpEarned = 0;

  screen.innerHTML = '';
  const bar = el('div', 'lesson-bar');
  const quitBtn = el('button', 'quit', '✕');
  quitBtn.title = 'Quit set';
  quitBtn.addEventListener('click', () => {
    if (confirm('Quit this set? Progress on answered questions is saved.')) showHome();
  });
  const progress = el('div', 'progress');
  const fill = el('div', 'progress-fill');
  progress.appendChild(fill);
  const xpTag = el('div', 'lesson-xp', '+0 XP');
  bar.append(quitBtn, progress, xpTag);
  screen.appendChild(bar);

  const qHost = el('div', 'q-host');
  screen.appendChild(qHost);

  const actions = el('div', 'lesson-actions');
  const btn = el('button', 'btn primary big', 'Check');
  actions.appendChild(btn);
  screen.appendChild(actions);

  let player = null;
  let phase = 'answer'; // 'answer' | 'continue'

  function onAnswered(correct) {
    const q = questions[idx];
    const xp = S.recordAnswer(q.id, q.tier, correct);
    xpEarned += xp;
    if (correct) correctCount += 1;
    xpTag.textContent = `+${xpEarned} XP`;
    updateHeader();
    phase = 'continue';
    btn.textContent = idx + 1 < questions.length ? 'Continue' : 'Finish';
    btn.classList.add('continue');
    btn.style.display = '';
    btn.focus();
  }

  function show() {
    fill.style.width = `${(idx / questions.length) * 100}%`;
    const q = questions[idx];
    player = renderQuestion(qHost, q, onAnswered);
    phase = 'answer';
    btn.textContent = 'Check';
    btn.classList.remove('continue');
    // self-graded cards own their reveal + rating; hide the primary button
    // until the card reports an answer.
    btn.style.display = player.selfGraded ? 'none' : '';
  }

  btn.addEventListener('click', () => {
    if (phase === 'answer') {
      const res = player.check();
      if (res === null) {
        btn.classList.add('shake');
        setTimeout(() => btn.classList.remove('shake'), 350);
      }
    } else {
      idx += 1;
      if (idx < questions.length) show();
      else finishLesson(questions.length, correctCount, xpEarned, title);
    }
  });

  const keyHandler = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (phase === 'answer' && player.selfGraded) player.check();
      else btn.click();
    }
  };
  document.addEventListener('keydown', keyHandler);
  screen._cleanup = () => document.removeEventListener('keydown', keyHandler);

  show();
}

function finishLesson(total, correct, xpEarned, title) {
  if (screen._cleanup) screen._cleanup();
  const perfect = correct === total;
  const bonus = perfect ? 20 : 0;
  const { streakExtended, streak } = S.completeLesson(bonus);
  updateHeader();

  screen.innerHTML = '';
  const card = el('div', 'results');
  card.appendChild(el('div', 'results-title', perfect ? '💯 Perfect set!' : '✅ Set complete'));
  card.appendChild(el('div', 'results-sub', title));
  const grid = el('div', 'results-grid');
  grid.appendChild(statBox('⭐ XP earned', `+${xpEarned + bonus}${bonus ? ` (incl. +${bonus} bonus)` : ''}`));
  grid.appendChild(statBox('🎯 Self-score', `${correct}/${total}`));
  grid.appendChild(
    statBox('🔥 Streak', streakExtended ? `${streak} day${streak > 1 ? 's' : ''} — extended!` : `${streak} (banked today)`)
  );
  card.appendChild(grid);
  const home = el('button', 'btn primary big', 'Back to topics');
  home.addEventListener('click', showHome);
  card.appendChild(home);
  screen.appendChild(card);
  home.focus();
}

function statBox(label, value) {
  const b = el('div', 'stat-box');
  b.appendChild(el('div', 'stat-label', label));
  b.appendChild(el('div', 'stat-value', value));
  return b;
}

// --------------------------------------------------------------------------
document.getElementById('brand-home').addEventListener('click', showHome);

loadBank().then(() => {
  if (!bank.all.length) {
    screen.innerHTML =
      '<div class="hero"><div class="hero-text">No questions found. Serve this folder over HTTP (e.g. <code>python3 -m http.server</code>) so <code>data/questions/*.json</code> can load.</div></div>';
    return;
  }
  showHome();
});
