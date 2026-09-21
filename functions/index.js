// Deploy this with: firebase deploy --only functions
// Requires the Firebase "Blaze" (pay-as-you-go) plan — Cloud Functions
// don't run on the free Spark plan. Blaze still has a generous free
// tier; at this app's scale you're very unlikely to be billed anything.
//
// This function watches every session document. When SOS turns on, or
// new media is added, it sends a real push notification via Expo's
// push service to whichever phone(s) registered a token for that
// session — so the alert reaches the guardian even if their app isn't
// open.

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const fetch = require("node-fetch");

async function sendExpoPush(token, title, body) {
  if (!token) return;
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: token,
      sound: "default",
      title,
      body,
      priority: "high",
      channelId: "sos",
    }),
  });
}

exports.onSessionChange = onDocumentUpdated("sessions/{code}", async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();
  const code = event.params.code;

  const sosJustTurnedOn = after.sos?.active && !before.sos?.active;
  const newMedia = (after.media?.length || 0) > (before.media?.length || 0);

  if (sosJustTurnedOn) {
    await sendExpoPush(
      after.guardianToken,
      "🚨 SOS Alert",
      `Your contact just sent an SOS. Open Safety Pryde now.`
    );
  }

  if (newMedia) {
    await sendExpoPush(
      after.guardianToken,
      "📷 New safety media",
      `New photo/video was shared from session ${code}.`
    );
  }
});
