import { messaging, auth, db } from './config.js';
import { getToken } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js";
import { doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// REPLACE THIS WITH YOUR GENERATED KEY FROM FIREBASE CONSOLE
const VAPID_KEY = "BMLQFKUJ2NucFVGbsQ4mt6Wu3SWc2fMRU0DEsLcCmEP7kR3ynQBAu-PNIekD2vBaFN7Raci3AIyVR-gdqN1SSxc"; 

export async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log("Notification permission granted.");
            
            // Get FCM Token for this device
            const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
            
            if (currentToken) {
                const user = auth.currentUser;
                if(user) {
                    // Save token to user's profile securely
                    await updateDoc(doc(db, "users", user.uid), {
                        fcmTokens: arrayUnion(currentToken)
                    });
                    console.log("Device registered for emergency alerts.");
                }
            } else {
                console.log("No registration token available.");
            }
        } else {
            console.warn("User denied notification permissions.");
            alert("Warning: You must enable notifications to receive SOS alerts from family.");
        }
    } catch (error) {
        console.error("An error occurred while retrieving token. ", error);
    }
}
