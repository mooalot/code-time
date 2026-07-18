// Skill tree + company map. Order in TOPICS is the suggested learning path.
// Icons are inline SVG glyphs (stroke = currentColor).

const S = (body) =>
  `<svg viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

// Target companies. `topics` lists the topic ids each one tends to probe (from
// public interview-format research), so the home screen can focus practice on
// one target. Edit this list to match your own job search.
export const COMPANIES = [
  { id: 'figma',       name: 'Figma',        blurb: 'Rigorous, product-flavored practical DSA (undo/redo, tries, interval trees) + two system-design rounds. The project deep-dive is heavily weighted.',
    topics: ['js-core', 'async-js', 'typescript', 'react', 'frontend-css', 'web-platform', 'dsa-arrays', 'dsa-graphs', 'complexity', 'implement', 'practical', 'system-design', 'behavioral'] },
  { id: 'bubble',      name: 'Bubble',       blurb: 'Standard easy-medium DSA + "design a scalable multi-tenant backend". Mobile Platform = deep React Native (Fabric/TurboModules).',
    topics: ['js-core', 'async-js', 'typescript', 'react', 'frontend-css', 'web-platform', 'dsa-arrays', 'complexity', 'implement', 'practical', 'testing', 'system-design', 'sql', 'behavioral'] },
  { id: 'webflow',     name: 'Webflow',      blurb: 'Staff DevProd. Practical live coding in their own IDE + polished project presentation + platform/CI-CD system design.',
    topics: ['js-core', 'async-js', 'typescript', 'react', 'frontend-css', 'web-platform', 'implement', 'practical', 'testing', 'system-design', 'behavioral'] },
  { id: 'omada',       name: 'Omada Health', blurb: 'Rails pair-programming (debug/extend a small app, TDD) + a dedicated system-design round. Not LeetCode.',
    topics: ['rails', 'sql', 'practical', 'testing', 'system-design', 'web-platform', 'react', 'behavioral'] },
  { id: 'instructure', name: 'Instructure',  blurb: 'Rails + heavy SQL, two-interviewer rounds. Live coding is easy-medium (RPN/stack, sliding window). AI/Claude Code is culture.',
    topics: ['rails', 'sql', 'ai-llm', 'react', 'practical', 'testing', 'system-design', 'web-platform', 'behavioral'] },
  { id: 'rula',        name: 'Rula',         blurb: 'Signature problem is Conway’s Game of Life (grid sim). Bring your own IDE. Dedicated ~50-min system-design round.',
    topics: ['js-core', 'typescript', 'react', 'frontend-css', 'dsa-arrays', 'web-platform', 'sql', 'implement', 'practical', 'testing', 'system-design', 'behavioral'] },
  { id: 'neighbor',    name: 'Neighbor',     blurb: 'Practical, product-framed coding + take-home; CEO final round. Study two-sided-marketplace data modeling.',
    topics: ['js-core', 'typescript', 'react', 'frontend-css', 'rails', 'sql', 'practical', 'testing', 'system-design', 'behavioral'] },
  { id: 'podium',      name: 'Podium',       blurb: 'Take-home-heavy (build a small Phoenix app) + review. Elixir not required — they value FP aptitude.',
    topics: ['elixir', 'js-core', 'react', 'sql', 'practical', 'testing', 'system-design', 'web-platform', 'behavioral'] },
  { id: 'distru',      name: 'Distru',       blurb: 'Take-home-centric + conversational technical; CTO final. Rewards code quality & ERP data modeling over Elixir mastery.',
    topics: ['elixir', 'js-core', 'typescript', 'react', 'frontend-css', 'sql', 'implement', 'practical', 'testing', 'system-design', 'behavioral'] },
  { id: 'canopy',      name: 'Canopy',       blurb: 'Take-home + code-review walkthrough. Micro-frontends (single-spa) on the front; polyglot Python/Java/Kotlin back.',
    topics: ['js-core', 'typescript', 'react', 'frontend-css', 'go-python', 'sql', 'implement', 'practical', 'testing', 'system-design', 'behavioral'] },
  { id: 'filevine',    name: 'Filevine',     blurb: 'Practical live exercise + team/CTO values screens. Mostly Node/React, but .NET/LINQ pockets appear. Client-facing FDE role.',
    topics: ['js-core', 'async-js', 'typescript', 'react', 'frontend-css', 'web-platform', 'sql', 'implement', 'practical', 'testing', 'system-design', 'behavioral'] },
  { id: 'bestow',      name: 'Bestow',       blurb: 'A SQL problem AND an easy-medium LeetCode problem. They want you thinking aloud continuously.',
    topics: ['js-core', 'typescript', 'react', 'frontend-css', 'go-python', 'sql', 'dsa-arrays', 'implement', 'practical', 'testing', 'system-design', 'behavioral'] },
  { id: 'oneimaging',  name: 'OneImaging',   blurb: 'Early-stage, founder-driven. Practical full-stack (debug across the stack). Portfolio/GitHub reviewed.',
    topics: ['js-core', 'typescript', 'react', 'frontend-css', 'web-platform', 'dsa-arrays', 'implement', 'practical', 'testing', 'behavioral'] },
  { id: 'techcyte',    name: 'Techcyte',     blurb: 'CS-fundamentals quizzes + easy LeetCode + live coding in an in-browser IDE. Java/Python/React pathology-AI platform.',
    topics: ['js-core', 'typescript', 'react', 'frontend-css', 'web-platform', 'complexity', 'ai-llm', 'sql', 'practical', 'testing', 'behavioral'] },
];

export const TOPICS = [
  {
    id: 'js-core',
    title: 'JavaScript Core',
    icon: S('<path d="M14 8 6 22l8 14M30 8l8 14-8 14"/>'),
    blurb: 'Closures, scope, this, prototypes, coercion, modules',
  },
  {
    id: 'async-js',
    title: 'Async & Event Loop',
    icon: S('<path d="M8 22a14 14 0 1 1 4 9.8"/><path d="M8 22h-4M8 22l4-4M8 22l4 4"/>'),
    blurb: 'Event loop, promises, async/await, microtasks, concurrency',
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    icon: S('<rect x="6" y="6" width="32" height="32" rx="5"/><path d="M14 20h10M19 20v11M27 30q3 2 6 0t0-5-6-2 0-5 5-1" stroke-width="2"/>'),
    blurb: 'Types, generics, narrowing, utility types, structural typing',
  },
  {
    id: 'react',
    title: 'React & Frontend',
    icon: S('<circle cx="22" cy="22" r="3"/><ellipse cx="22" cy="22" rx="18" ry="7"/><ellipse cx="22" cy="22" rx="18" ry="7" transform="rotate(60 22 22)"/><ellipse cx="22" cy="22" rx="18" ry="7" transform="rotate(120 22 22)"/>'),
    blurb: 'Hooks, rendering, reconciliation, state, effects, performance',
  },
  {
    id: 'frontend-css',
    title: 'CSS, HTML & Accessibility',
    icon: S('<rect x="5" y="9" width="34" height="26" rx="3"/><path d="M5 17h34M13 9v8M13 26h9M28 30h6"/>'),
    blurb: 'Flexbox/grid, specificity, box model, positioning, semantic HTML, ARIA & keyboard a11y',
  },
  {
    id: 'web-platform',
    title: 'Web, HTTP & Browser',
    icon: S('<circle cx="22" cy="22" r="16"/><path d="M6 22h32M22 6c5 5 5 27 0 32M22 6c-5 5-5 27 0 32"/>'),
    blurb: 'HTTP, REST, caching, CORS, auth, rendering, security',
  },
  {
    id: 'dsa-arrays',
    title: 'Arrays, Strings & Hashing',
    icon: S('<rect x="5" y="16" width="10" height="12"/><rect x="17" y="16" width="10" height="12"/><rect x="29" y="16" width="10" height="12"/>'),
    blurb: 'Hash maps, two-pointer, sliding window, prefix sums, intervals',
  },
  {
    id: 'dsa-graphs',
    title: 'Trees, Graphs & Recursion',
    icon: S('<circle cx="22" cy="8" r="4"/><circle cx="10" cy="30" r="4"/><circle cx="34" cy="30" r="4"/><path d="M20 11 12 27M24 11l8 16"/>'),
    blurb: 'BFS/DFS, recursion, backtracking, heaps, tries, graph traversal',
  },
  {
    id: 'complexity',
    title: 'Complexity & Sorting',
    icon: S('<path d="M6 38 18 20l8 8L38 8"/><path d="M6 8v30h32" stroke-width="1.6" opacity="0.5"/>'),
    blurb: 'Big-O, sorting, binary search, dynamic-programming basics',
  },
  {
    id: 'implement',
    title: 'Implement It (from scratch)',
    icon: S('<path d="M25 9l10 10-4 4-10-10z"/><path d="M21 13 6 28l6 6 15-15"/><path d="M31 27l3 3 5-6" stroke-width="2"/>'),
    blurb: 'debounce/throttle, deepClone, curry, memoize, EventEmitter, Promise.all, LRU cache, UI widgets',
  },
  {
    id: 'practical',
    title: 'Practical Coding & Take-homes',
    icon: S('<rect x="5" y="9" width="34" height="26" rx="3"/><path d="M5 16h34" stroke-width="1.8"/><path d="M12 24l4 4-4 4M22 32h8" stroke-width="2"/>'),
    blurb: 'Debug/extend an unfamiliar repo, code review, take-home strategy, thinking aloud',
  },
  {
    id: 'testing',
    title: 'Testing & Quality',
    icon: S('<path d="M18 5v13L8 33a4 4 0 0 0 4 6h20a4 4 0 0 0 4-6L26 18V5"/><path d="M15 5h14M16 26h12"/>'),
    blurb: 'Test pyramid, unit vs integration vs e2e, mocking, RTL, TDD, what to test, flaky tests',
  },
  {
    id: 'system-design',
    title: 'System Design',
    icon: S('<rect x="16" y="4" width="12" height="10" rx="2"/><rect x="4" y="30" width="12" height="10" rx="2"/><rect x="28" y="30" width="12" height="10" rx="2"/><path d="M22 14v9M22 23H10v7M22 23h12v7"/>'),
    blurb: 'Backend + frontend design: APIs, caching, scaling, queues, multi-tenancy, RADIO, CI/CD',
  },
  {
    id: 'sql',
    title: 'SQL & Data Modeling',
    icon: S('<ellipse cx="22" cy="10" rx="15" ry="5"/><path d="M7 10v12c0 2.8 6.7 5 15 5s15-2.2 15-5V10M7 22v12c0 2.8 6.7 5 15 5s15-2.2 15-5V22"/>'),
    blurb: 'Joins, indexing, N+1, transactions, normalization, query plans',
  },
  {
    id: 'rails',
    title: 'Ruby on Rails',
    icon: S('<path d="M6 30c0-13 11-24 24-24 0 0 2 10-6 18s-18 6-18 6z"/><circle cx="17" cy="27" r="3"/>'),
    blurb: 'Ruby idioms, ActiveRecord, MVC, migrations, conventions (Omada/Instructure/Neighbor)',
  },
  {
    id: 'elixir',
    title: 'Elixir & Phoenix',
    icon: S('<path d="M22 4c6 8 12 12 12 22a12 12 0 0 1-24 0c0-6 6-8 6-14 3 4 8 5 6 6z"/>'),
    blurb: 'Pattern matching, immutability, OTP/processes, Phoenix, LiveView (Podium/Distru)',
  },
  {
    id: 'go-python',
    title: 'Go & Python',
    icon: S('<circle cx="14" cy="16" r="9"/><circle cx="12" cy="14" r="1.6" fill="currentColor" stroke="none"/><path d="M23 28h13a4 4 0 0 1 0 8H20a4 4 0 0 1 0-8h3v-6" /><circle cx="30" cy="24" r="1.4" fill="currentColor" stroke="none"/>'),
    blurb: 'Go concurrency/goroutines, Python idioms, typing, gotchas (Bestow/Canopy)',
  },
  {
    id: 'ai-llm',
    title: 'AI & LLM Engineering',
    icon: S('<rect x="12" y="14" width="20" height="18" rx="4"/><path d="M22 14V7M22 7h-3M22 7h3M8 20v6M36 20v6M18 22v2M26 22v2"/><path d="M18 28h8" stroke-width="1.8"/>'),
    blurb: 'Prompting, agentic loops, RAG, evals, tokens, context (Instructure/Techcyte + your edge)',
  },
  {
    id: 'behavioral',
    title: 'Behavioral & Fit',
    icon: S('<circle cx="22" cy="15" r="8"/><path d="M8 38c0-8 6-13 14-13s14 5 14 13"/>'),
    blurb: 'STAR stories, conflict, trade-offs, questions to ask, salary talk',
  },
];

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
export const COMPANY_BY_ID = Object.fromEntries(COMPANIES.map((c) => [c.id, c]));

// Which topics to show for the active company focus ('all' => every topic).
export function topicsForCompany(companyId) {
  if (!companyId || companyId === 'all') return TOPICS;
  const c = COMPANY_BY_ID[companyId];
  if (!c) return TOPICS;
  const set = new Set(c.topics);
  return TOPICS.filter((t) => set.has(t.id));
}
