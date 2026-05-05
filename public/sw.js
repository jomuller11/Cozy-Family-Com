const CACHE_NAME = "casa-nube-v3";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

async function appendNotifHistory(title, body) {
  const cache = await caches.open("notif-history-v1");
  const existing = await cache.match("/notif-history");
  const history = existing ? await existing.json() : [];
  history.unshift({ title, body, ts: Date.now() });
  await cache.put("/notif-history", new Response(JSON.stringify(history.slice(0, 30)), {
    headers: { "Content-Type": "application/json" },
  }));
}

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "Cozy&Casa";
  const body = data.body || "";
  const options = {
    body,
    icon: "./icon.svg",
    badge: "./icon.svg",
    data: { url: data.url || "/" },
    vibrate: [100, 50, 100],
  };
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      appendNotifHistory(title, body),
    ])
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const c of list) {
          if ("focus" in c) return c.focus();
        }
        return clients.openWindow(event.notification.data?.url || "/");
      }),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
