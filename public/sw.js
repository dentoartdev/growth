// Minimal service worker: makes the app installable and shows a simple page when offline.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(fetch(e.request).catch(() => new Response(
    "<meta name=viewport content='width=device-width'><body style='font-family:-apple-system;padding:40px;color:#12151C;background:#EFF1F4'><h2>You are offline</h2><p>Connect to the internet and open Growth again.</p>",
    { headers: { "Content-Type": "text/html" } })));
});
