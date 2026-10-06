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
const authContainer = document.getElementById('auth-container');

// Create a loading text
const loadingOverlay = document.createElement('div');
loadingOverlay.innerHTML = '<p class="text-red-500 font-bold tracking-widest animate-pulse text-center mt-10 uppercase">Loading Session...</p>';
authContainer.parentNode.insertBefore(loadingOverlay, authContainer);

// Hide forms initially while checking if user is already logged in
authContainer.style.display = 'none';

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

function showError(msg) {
    errorMsg.innerText = msg;
    errorMsg.classList.remove('hidden');
}

// AUTO-LOGIN CHECKER
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in, redirect them immediately to dashboard!
        window.location.replace('dashboard.html');
    } else {
        // User is definitely NOT logged in. Show the login form.
        loadingOverlay.style.display = 'none';
        authContainer.style.display = 'block';
    }
});

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-login');
    btn.innerText = "VERIFYING...";
    btn.disabled = true;

    try {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        await signInWithEmailAndPassword(auth, email, pass);
        // Page will auto-redirect via onAuthStateChanged
    } catch (error) {
        showError(error.message.replace('Firebase: ', ''));
        btn.innerText = "SECURE LOGIN";
        btn.disabled = false;
    }
});

// Handle Registration
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-register');
    btn.innerText = "CREATING...";
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
            linkedFamily: [], 
            fcmTokens: []     
        });

        // Page will auto-redirect via onAuthStateChanged
    } catch (error) {
        showError(error.message.replace('Firebase: ', ''));
        btn.innerText = "REGISTER ACCOUNT";
        btn.disabled = false;
    }
});
