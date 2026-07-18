# Question authoring spec

Questions live in `data/questions/<topic-id>.json` — one file per topic, a JSON
**array** of question objects. Topic ids and their prefixes:

| topic id        | prefix | topic id        | prefix |
|-----------------|--------|-----------------|--------|
| `js-core`       | `jsc`  | `implement`     | `impl` |
| `async-js`      | `asy`  | `practical`     | `prc`  |
| `typescript`    | `ts`   | `testing`       | `test` |
| `react`         | `rct`  | `system-design` | `sys`  |
| `frontend-css`  | `css`  | `sql`           | `sql`  |
| `web-platform`  | `web`  | `rails`         | `rb`   |
| `dsa-arrays`    | `arr`  | `elixir`        | `elx`  |
| `dsa-graphs`    | `grp`  | `go-python`     | `gop`  |
| `complexity`    | `cpx`  | `ai-llm`        | `ai`   |
|                 |        | `behavioral`    | `beh`  |

## Common fields (all questions)

- `id` — `<prefix>-NNN`, zero-padded, unique (e.g. `jsc-001`).
- `topic` — the topic id (matches the filename).
- `tier` — `1` warm-up (definition/intuition), `2` core (the bread-and-butter
  question actually asked), `3` stretch (senior/staff depth or a hard variant).
- `type` — `"mc"`, `"predict"`, `"dsa"`, or `"flashcard"`.
- `prompt` — the question text. Supports inline `` `code` ``, `**bold**`,
  `*italic*`. Escape nothing else; raw `<`/`>` are fine (auto-escaped).
- `code` — *optional* multi-line code snippet shown in a highlighted block.
- `lang` — language for `code` (`js`, `ts`, `jsx`, `tsx`, `py`, `ruby`,
  `elixir`, `go`, `sql`). Defaults to `js`.

## type: "mc" (multiple choice) — auto-graded

- `choices` — array of 3–5 strings (may contain inline `code`/markdown).
  Distractors must encode **real misconceptions**, not filler.
- `answer` — index (0-based) of the correct choice. Choices shuffle at runtime.
- `explanation` — 1–4 sentences shown after answering. Teach the why.

## type: "predict" (predict the output) — auto-graded

Show `code`, the user types what it logs/returns.

- `answers` — array of acceptable answers (strings). Grading trims, collapses
  inner whitespace, and strips one layer of surrounding quotes, so `"6"`, `6`,
  and `'6'` all match. Include every reasonable spelling (e.g. `["undefined"]`,
  `["[1, 2, 3]", "[1,2,3]"]`). Keep outputs short and unambiguous.
- `placeholder` — *optional* input hint.
- `explanation` — required; explain the gotcha.

Only use `predict` when the output is short and unambiguous. Prefer it for
closures, coercion, event-loop ordering, `this`, hoisting.

## type: "dsa" (algorithm drill) — self-graded

The user sketches an approach, reveals the model answer, self-rates.

- `prompt` — the problem statement (include constraints + a tiny example).
- `code` — *optional* starter/example (e.g. the signature or a sample I/O).
- `reveal` — object:
  - `approach` — the pattern + how to apply it (2–5 sentences). **Name the
    pattern** (two-pointer, sliding window, BFS, DFS, backtracking, heap, DP…).
  - `code` — *optional* reference solution (short, correct, idiomatic).
  - `lang` — language for `reveal.code`.
  - `complexity` — time & space, e.g. `` `O(n)` time, `O(1)` space ``.
  - `insight` — the one thing that unlocks it / the trap.
  - `link` — *optional* URL to practice (LeetCode etc.).

Keep DSA **easy–medium** except where a company demands harder (Figma):
mark those tier 3 and say so.

## type: "flashcard" (open concept / behavioral) — self-graded

For system design, behavioral, and concepts with no single crisp answer.

- `prompt` — the question / scenario.
- `reveal` — object:
  - `answer` — *optional* model answer paragraph.
  - `points` — *optional* array of bullet points to hit.
  - `trap` — *optional* the common mistake / what a weak answer sounds like.
  At least one of `answer` / `points` is required.

## Quality bar

- **Verify every technical claim and every predicted output.** Run the code in
  your head carefully; wrong answers are worse than no question.
- Questions should reflect what these specific companies actually ask (see the
  company blurbs in `js/topics.js`). Prefer realistic, practical framing over
  trivia.
- Tier mix per topic: ~30% tier 1, ~45% tier 2, ~25% tier 3.
- Type mix: use the type that fits the concept. Concept checks → `mc`; "what
  does this print" → `predict`; algorithms → `dsa`; design/behavioral/no-single-
  answer → `flashcard`.
- 10–14 questions per topic.
- Explanations teach; they don't just assert. Reference the mental model.
