const CACHE = "budget-app-v1";
const DATEIEN = ["./", "index.html", "style.css", "app.js", "manifest.json", "icon-192.png", "icon-512.png"];

// Beim Installieren: alle Dateien für offline speichern
self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(DATEIEN)));
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

// Zuerst online die neueste Version holen, ohne Internet die gespeicherte nehmen
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(function (antwort) {
        const kopie = antwort.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, kopie));
        return antwort;
      })
      .catch(() => caches.match(event.request))
  );
});