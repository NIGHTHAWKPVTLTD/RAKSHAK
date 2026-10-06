import { auth, db } from './config.js';
import { doc, setDoc, getDoc, updateDoc, onSnapshot, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const btnGenerate = document.getElementById('btn-generate-code');
const displayCode = document.getElementById('invite-code-display');
const inviteStatus = document.getElementById('invite-status');

const inputCode = document.getElementById('input-invite-code');
const btnSubmit = document.getElementById('btn-submit-code');
const guardianList = document.getElementById('guardian-list');

// Generate a random 6-character alphanumeric code
function generateRandomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// 1. GENERATE CODE FLOW
btnGenerate.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return alert("Must be logged in.");

    const code = generateRandomCode();
    
    // Save to Firestore 'invites' collection
    await setDoc(doc(db, "invites", code), {
        ownerId: user.uid,
        status: "PENDING",
        timestamp: new Date().toISOString()
    });

    displayCode.innerText = code;
    displayCode.classList.remove('hidden');
    inviteStatus.classList.remove('hidden');
    btnGenerate.classList.add('hidden');

    // Listen for the family member to accept it
    onSnapshot(doc(db, "invites", code), async (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.status === "ACCEPTED" && data.acceptedBy) {
                // Family accepted! Add them to OUR trusted linkedFamily array securely.
                await updateDoc(doc(db, "users", user.uid), {
                    linkedFamily: arrayUnion(data.acceptedBy)
                });
                inviteStatus.innerText = "✅ Family Linked Successfully!";
                inviteStatus.classList.replace('text-yellow-400', 'text-green-400');
                inviteStatus.classList.remove('animate-pulse');
            }
        }
    });
});

// 2. ACCEPT CODE FLOW
btnSubmit.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return alert("Must be logged in.");
    
    const code = inputCode.value.trim().toUpperCase();
    if (code.length !== 6) return alert("Invalid code.");

    btnSubmit.innerText = "...";
    
    try {
        const inviteRef = doc(db, "invites", code);
        const inviteSnap = await getDoc(inviteRef);
        
        if (!inviteSnap.exists()) {
            alert("Code not found or expired.");
            btnSubmit.innerText = "LINK";
            return;
        }

        const inviteData = inviteSnap.data();
        if (inviteData.ownerId === user.uid) {
            alert("You cannot link yourself.");
            btnSubmit.innerText = "LINK";
            return;
        }

        // Mark code as accepted with OUR uid
        await updateDoc(inviteRef, {
            status: "ACCEPTED",
            acceptedBy: user.uid
        });

        alert("✅ Successfully Linked! You will now receive their SOS alerts.");
        inputCode.value = "";
        btnSubmit.innerText = "LINK";

    } catch (error) {
        console.error(error);
        alert("Failed to link family member.");
        btnSubmit.innerText = "LINK";
    }
});

// 3. DISPLAY CONNECTED GUARDIANS
auth.onAuthStateChanged((user) => {
    if(user) {
        // Real-time listener for current user's profile
        onSnapshot(doc(db, "users", user.uid), async (docSnap) => {
            guardianList.innerHTML = ""; // clear list
            
            if(docSnap.exists()){
                const data = docSnap.data();
                const familyIds = data.linkedFamily || [];
                
                if (familyIds.length === 0) {
                    guardianList.innerHTML = `<p class="text-sm text-gray-500 text-center italic">No guardians connected yet.</p>`;
                    return;
                }

                // Fetch details for each connected family member
                for(let gUid of familyIds) {
                    const gSnap = await getDoc(doc(db, "users", gUid));
                    if(gSnap.exists()) {
                        const gData = gSnap.data();
                        const card = document.createElement('div');
                        card.className = "bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700";
                        card.innerHTML = `
                            <div>
                                <p class="font-bold text-white">${gData.name}</p>
                                <p class="text-xs text-gray-400">${gData.phone}</p>
                            </div>
                            <span class="text-xs font-bold px-2 py-1 bg-green-900/50 text-green-400 rounded">ACTIVE</span>
                        `;
                        guardianList.appendChild(card);
                    }
                }
            }
        });
    } else {
        window.location.replace("index.html");
    }
});
