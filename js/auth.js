import { auth, db } from './config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const errorMsg = document.getElementById('auth-error');

// Toggle UI
document.getElementById('toggle-register').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    errorMsg.classList.add('hidden');
});

document.getElementById('toggle-login').addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    errorMsg.classList.add('hidden');
});

// Auto-redirect if already logged in
onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.includes('index.html')) {
        window.location.replace('dashboard.html');
    }
});

function showError(msg) {
    errorMsg.innerText = msg;
    errorMsg.classList.remove('hidden');
}

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-login');
    btn.innerText = "LOADING...";
    btn.disabled = true;

    try {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        await signInWithEmailAndPassword(auth, email, pass);
        window.location.replace('dashboard.html');
    } catch (error) {
        showError(error.message.replace('Firebase: ', ''));
        btn.innerText = "LOG IN";
        btn.disabled = false;
    }
});

// Handle Registration
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-register');
    btn.innerText = "CREATING ACCOUNT...";
    btn.disabled = true;

    try {
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-password').value;
        const name = document.getElementById('reg-name').value;
        const phone = document.getElementById('reg-phone').value;

        // Create Auth Account
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        // Create corresponding Firestore Profile
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            phone: phone,
            linkedFamily: [], // Array of trusted Guardian UIDs
            fcmTokens: []     // Devices where push notifications go
        });

        window.location.replace('dashboard.html');
    } catch (error) {
        showError(error.message.replace('Firebase: ', ''));
        btn.innerText = "CREATE ACCOUNT";
        btn.disabled = false;
    }
});
