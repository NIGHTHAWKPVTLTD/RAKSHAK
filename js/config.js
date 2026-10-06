import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// ADDED setPersistence and browserLocalPersistence below
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"; 
import { getMessaging } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyC0PCn9byajsxg9zCKGWjTj08dhNczt2j8",
  authDomain: "rakshak-2-29a5d.firebaseapp.com",
  projectId: "rakshak-2-29a5d",
  storageBucket: "rakshak-2-29a5d.firebasestorage.app",
  messagingSenderId: "67575609457",
  appId: "1:67575609457:web:2b2bf13c2ecb0b1df643d0",
  measurementId: "G-EZYVE41636"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

// 1. FORCE PERMANENT LOGIN SAVING
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log("Local persistence enabled");
    })
    .catch((error) => {
        console.error("Error setting persistence:", error);
    });

// 2. ENABLE OFFLINE DATABASE
enableIndexedDbPersistence(db).catch((err) => {
    console.error("Offline persistence failed:", err.code);
});

export { app, auth, db, messaging };
