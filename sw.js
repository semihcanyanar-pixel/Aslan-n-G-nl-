// Bebek Günlüğü — minimal app-shell service worker.
// Only caches our own static files, so the app opens instantly even on a
// weak connection. It never touches Firebase requests — those always go
// straight to the network so your data stays live and accurate.
const CACHE_NAME = "bebek-gunlugu-shell-v1";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never cache Firebase / Google APIs or anything cross-origin — network only.
  if (url.origin !== self.location.origin) return;

  // App shell: cache-first, so the shell loads instantly, with a network
  // fallback that refreshes the cache for next time.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    }).catch(() => caches.match("./index.html"))
  );
});
