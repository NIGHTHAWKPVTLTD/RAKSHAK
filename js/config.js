import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // Replace with Vercel Environment Variables injected during build, or config
    authDomain: "rakshak-app.firebaseapp.com",
    projectId: "rakshak-app",
    storageBucket: "rakshak-app.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

// CRITICAL for HopWeb/PWA Mobile: Enable Offline Persistence
enableIndexedDbPersistence(db).catch((err) => {
    console.error("Offline persistence failed:", err.code);
});

export { app, auth, db, messaging };
