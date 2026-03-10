const CACHE_NAME = "quickbtc-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/styles.css",
  "/dashboard.js",
  "/payment.js",
  "/images/logo.png",
  "/images/btc.png",
  "/images/qr.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
