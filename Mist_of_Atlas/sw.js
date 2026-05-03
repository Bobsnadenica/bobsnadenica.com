const CACHE_NAME = 'mist-of-atlas-v1';
const ASSETS = [
  'index.html',
  'styles.css',
  'script.js',
  'icon.png',
  'privacy.html',
  'terms.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
