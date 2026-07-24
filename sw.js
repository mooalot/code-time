// Service worker: network-first with cache fallback. Online you always get the
// newest questions/code; offline everything still works from cache.
const CACHE = 'dryrun-v2';

const TOPICS = [
  'js-core', 'async-js', 'typescript', 'react', 'frontend-css', 'web-platform',
  'dsa-arrays', 'dsa-graphs', 'complexity', 'implement', 'practical', 'testing',
  'system-design', 'sql', 'postgres', 'rails', 'elixir', 'go-python', 'ai-llm', 'behavioral',
];

const CORE = [
  './',
  './index.html',
  './css/style.css',
  './manifest.webmanifest',
  './assets/icon.svg',
  './assets/icon-maskable.svg',
  './js/app.js',
  './js/question.js',
  './js/code.js',
  './js/state.js',
  './js/topics.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(async (c) => {
      await c.addAll(CORE);
      await Promise.allSettled(TOPICS.map((t) => c.add(`./data/questions/${t}.json`)));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
