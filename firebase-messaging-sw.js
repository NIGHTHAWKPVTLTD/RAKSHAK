importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC0PCn9byajsxg9zCKGWjTj08dhNczt2j8",
  projectId: "rakshak-2-29a5d",
  messagingSenderId: "67575609457",
  appId: "1:67575609457:web:2b2bf13c2ecb0b1df643d0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icons/icon-192x192.png',
    data: payload.data // Contains the eventId
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Click notification event -> opens emergency page
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const eventId = event.notification.data.eventId;
  const urlToOpen = new URL(`/emergency.html?id=${eventId}`, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
