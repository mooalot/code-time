# DryRun — coding-interview practice

A Duolingo-style PWA for grinding coding-interview prep: a topic tree, JSON
question banks, spaced-repetition, XP, levels, and a daily streak — all vanilla
JS, no build step, works offline.

Pick a company from the **Focus** dropdown and the topic grid narrows to what
that company's interviews actually tend to emphasize (mapping derived from
public interview-format research; edit `js/topics.js` to add your own targets).

## Run it

```bash
npm start          # python3 -m http.server 8000
# open http://localhost:8000
```

It must be served over HTTP (not `file://`) so `data/questions/*.json` can load.

## How questions are chosen

Every question lives in a Leitner spaced-repetition box. A "set" pulls **due
reviews first, then unseen, then your weakest boxes** (`js/state.js`). Get one
right and it moves up a box (longer until it's due again); miss it and it drops
to box 0. XP, levels, and the daily streak are the carrot.

## Topics & companies

20 topics grouped as: **JS/TS core** (js-core, async-js, typescript) ·
**frontend** (react, frontend-css, web-platform) · **algorithms** (dsa-arrays,
dsa-graphs, complexity) · **build-from-scratch** (implement) · **practical,
testing & design** (practical, testing, system-design) · **backend/stack** (sql,
postgres, rails, elixir, go-python) · **AI** (ai-llm) · **behavioral**.

Topics were chosen from a taxonomy audit of what these interviews actually cover:
beyond the DSA/JS/React core, that means **CSS/layout & accessibility**,
**"implement a utility from scratch"** (debounce, deepClone, LRU cache,
EventEmitter…), **testing**, and **frontend** system design (RADIO) — the
categories most study banks omit.

The topic ↔ company mapping (which company probes which topics) lives in
`js/topics.js` and was derived from interview-format research — most of these
companies run **practical/live-coding and take-homes**, not a LeetCode gauntlet
(Figma is the exception), so `practical` and `system-design` are first-class.

## Question formats

- **mc** — multiple choice concept checks (auto-graded).
- **predict** — "what does this code print?" you type the output (auto-graded).
- **dsa** — algorithm drills: sketch your approach, reveal the pattern +
  reference solution + complexity, self-rate.
- **flashcard** — open system-design / behavioral prompts: reveal a model answer
  + the points to hit, self-rate.

## Authoring

Question schema and the quality bar are in [QUESTIONS.md](QUESTIONS.md). One file
per topic under `data/questions/<topic-id>.json`. Validate with:

```bash
npm run validate   # node tools/validate.js
```

## Project layout

```
index.html            app shell
css/style.css         code-editor theme
js/topics.js          topic tree + company map
js/state.js           localStorage: XP, streak, spaced repetition
js/question.js        renders + grades the 4 question types
js/code.js            tiny dependency-free syntax highlighter
js/app.js             screens: home, lesson, results
data/questions/*.json the question banks
tools/validate.js     schema validator
```

## TODO

- [ ] Keep growing the banks — 14 per topic is a starting point.

App and maskable icons are `assets/icon.svg` / `assets/icon-maskable.svg`
(scalable SVG, referenced from the manifest); the in-tab favicon is inline SVG.
# code-time
