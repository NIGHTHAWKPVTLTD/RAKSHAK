const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.onSosCreated = functions.firestore
    .document("sosEvents/{eventId}")
    .onCreate(async (snap, context) => {
        const sosData = snap.data();
        const eventId = context.params.eventId;

        if (sosData.status !== "ACTIVE") return null;

        const db = admin.firestore();
        
        // 1. Get Protected User Details
        const userDoc = await db.collection("users").doc(sosData.userId).get();
        if (!userDoc.exists) return null;
        
        const userData = userDoc.data();
        const guardians = userData.linkedFamily || [];
        
        if (guardians.length === 0) {
            console.log("No linked family found for user:", sosData.userId);
            return null;
        }

        // 2. Collect FCM Tokens of all linked Guardians
        let targetTokens = [];
        for (let guardianUid of guardians) {
            const gDoc = await db.collection("users").doc(guardianUid).get();
            if (gDoc.exists && gDoc.data().fcmTokens) {
                targetTokens.push(...gDoc.data().fcmTokens);
            }
        }

        // 3. Construct Notification Payload
        const payload = {
            notification: {
                title: "🚨 RAKSHAK EMERGENCY",
                body: `${userData.name} has triggered an SOS! Tap immediately to respond.`,
            },
            data: {
                eventId: eventId,
                click_action: "FLUTTER_NOTIFICATION_CLICK" // Generic routing
            },
            tokens: targetTokens
        };

        // 4. Send FCM Multicast
        if (targetTokens.length > 0) {
            try {
                const response = await admin.messaging().sendMulticast(payload);
                console.log(`${response.successCount} messages sent successfully.`);
            } catch (error) {
                console.error("Error sending FCM:", error);
            }
        }

        // 5. [ARCHITECTURE FALLBACK] - External SMS API integration
        // Do NOT put API keys here. Use Firebase Environment Configuration.
        /*
        const smsApiKey = functions.config().sms.key; // Configured via Firebase CLI
        if (smsApiKey) {
            guardians.forEach(async (gUid) => {
                const gPhone = await getGuardianPhone(gUid);
                await sendSmsViaExternalProvider(smsApiKey, gPhone, `EMERGENCY: ${userData.name} triggered SOS.`);
            });
        }
        */
       
        return null;
    });
