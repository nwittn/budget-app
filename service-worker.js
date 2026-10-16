const CACHE = "budget-app-v2";
const DATEIEN = ["./", "index.html", "style.css", "app.js", "manifest.json", "icon-192.png", "icon-512.png"];

// Beim Installieren: alle Dateien für offline speichern
self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(DATEIEN)));
  self.skipWaiting();
});

// Alte Zwischenspeicher aufräumen
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(namen => Promise.all(namen.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Mit Internet: immer beim Server nachfragen, ob es eine neue Version gibt.
// Ohne Internet: die gespeicherte Version nehmen.
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") {
    return;
  }
  const eigeneDatei = new URL(event.request.url).origin === self.location.origin;
  let anfrage;
  if (eigeneDatei) {
    anfrage = fetch(event.request.url, { cache: "no-cache" });
  } else {
    anfrage = fetch(event.request); // z. B. die Excel-Bibliothek
  }
  event.respondWith(
    anfrage
      .then(function (antwort) {
        const kopie = antwort.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, kopie));
        return antwort;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
