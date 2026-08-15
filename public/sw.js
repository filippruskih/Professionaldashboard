// Deliberately minimal: this dashboard shows live, frequently-changing data
// (Instagram sync, agent runs), so nothing is cached — this service worker
// exists purely to satisfy the browser's "installable PWA" criteria
// (manifest + HTTPS + a service worker with a fetch handler). Every request
// still goes straight to the network.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
