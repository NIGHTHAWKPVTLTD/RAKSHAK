import { auth, db } from './config.js';
import { collection, addDoc, updateDoc, doc, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const sosBtn = document.getElementById('sos-btn');
const countdownUI = document.getElementById('countdown-ui');
const timerDisplay = document.getElementById('countdown-timer');
const cancelBtn = document.getElementById('cancel-btn');
const sendNowBtn = document.getElementById('send-now-btn');
const activeSosUI = document.getElementById('active-sos-ui');
const resolveBtn = document.getElementById('resolve-btn');

let countdownInterval;
let currentSosId = null;

// 1. SOS Button Click Handler
sosBtn.addEventListener('click', () => {
    countdownUI.classList.remove('hidden');
    let timeLeft = 5;
    timerDisplay.innerText = timeLeft;

    // Trigger Vibration if supported (crucial for physical feedback)
    if (navigator.vibrate) navigator.vibrate(200);

    countdownInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (navigator.vibrate) navigator.vibrate(100);

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            triggerSOS();
        }
    }, 1000);
});

// 2. Cancel SOS
cancelBtn.addEventListener('click', () => {
    clearInterval(countdownInterval);
    countdownUI.classList.add('hidden');
});

// 3. Send Now
sendNowBtn.addEventListener('click', () => {
    clearInterval(countdownInterval);
    triggerSOS();
});

// 4. Trigger SOS Backend Logic
async function triggerSOS() {
    countdownUI.classList.add('hidden');
    sosBtn.classList.add('hidden');
    activeSosUI.classList.remove('hidden');
    
    // Fallback location
    let locationData = { lat: null, lng: null, accuracy: null, available: false };

    // Request Location
    if ('geolocation' in navigator) {
        try {
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000, // Don't delay SOS forever for location
                    maximumAge: 0
                });
            });
            locationData = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                available: true
            };
        } catch (error) {
            console.warn("Location unavailable during SOS, sending anyway.", error);
        }
    }

    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Not authenticated");

        // Write to Firestore (This works even offline thanks to persistence)
        const docRef = await addDoc(collection(db, "sosEvents"), {
            userId: user.uid,
            status: "ACTIVE",
            timestamp: serverTimestamp(),
            location: locationData,
            responses: []
        });

        currentSosId = docRef.id;
        listenToSOSUpdates(currentSosId);

    } catch (err) {
        console.error("Error sending SOS:", err);
        alert("Failed to create SOS. Check connection.");
        resetUI();
    }
}

// 5. Listen for Family Responses Real-time
function listenToSOSUpdates(eventId) {
    const unsub = onSnapshot(doc(db, "sosEvents", eventId), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.responses && data.responses.length > 0) {
                // Guardian responded
                document.getElementById('response-status').innerText = "✅ A family member is responding!";
                document.getElementById('response-status').classList.replace('text-yellow-400', 'text-green-400');
                if (navigator.vibrate) navigator.vibrate([500, 200, 500]); // Alert the protected user
            }
        }
    });
}

// 6. Resolve Emergency
resolveBtn.addEventListener('click', async () => {
    if (confirm("Are you sure you are safe and want to cancel the emergency alert?")) {
        try {
            await updateDoc(doc(db, "sosEvents", currentSosId), {
                status: "CANCELLED",
                resolvedAt: serverTimestamp()
            });
            resetUI();
        } catch(err) {
            console.error(err);
        }
    }
});

function resetUI() {
    activeSosUI.classList.add('hidden');
    sosBtn.classList.remove('hidden');
    currentSosId = null;
    document.getElementById('response-status').innerText = "Waiting for family response...";
    document.getElementById('response-status').classList.replace('text-green-400', 'text-yellow-400');
        }
