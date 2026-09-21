import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "./firebaseConfig";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCode(length = 5) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export async function createSession(code, protectedUid) {
  await setDoc(doc(db, "sessions", code), {
    createdAt: serverTimestamp(),
    protectedUid,
    guardianToken: null, // filled in when guardian registers for push
    protectedToken: null,
    locationActive: false,
    location: null,
    sos: { active: false, timestamp: null },
    media: [],
  });
}

export function subscribeToSession(code, onData, onError) {
  return onSnapshot(
    doc(db, "sessions", code),
    (snap) => onData(snap.exists() ? snap.data() : null),
    onError
  );
}

export async function sessionExists(code) {
  const snap = await getDoc(doc(db, "sessions", code));
  return snap.exists();
}

export async function updateLocation(code, coords) {
  await updateDoc(doc(db, "sessions", code), {
    locationActive: true,
    location: {
      lat: coords.latitude,
      lng: coords.longitude,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function setLocationInactive(code) {
  await updateDoc(doc(db, "sessions", code), { locationActive: false });
}

export async function setSOS(code, active) {
  await updateDoc(doc(db, "sessions", code), {
    sos: { active, timestamp: active ? new Date().toISOString() : null },
  });
}

export async function registerPushToken(code, role, token) {
  const field = role === "guardian" ? "guardianToken" : "protectedToken";
  await updateDoc(doc(db, "sessions", code), { [field]: token });
}

// Uploads a photo/video file (as a blob/URI) to Firebase Storage and
// records a pointer to it in the session document. Keeping the original,
// untouched file + a server-generated timestamp matters if this footage
// is ever handed to police — don't let the app edit or compress it
// further than necessary, and never let a user delete it once uploaded.
export async function uploadMedia(code, blob, type) {
  const filename = `sessions/${code}/${Date.now()}.${type === "video" ? "webm" : "jpg"}`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, blob, {
    contentType: type === "video" ? "video/mp4" : "image/jpeg",
  });
  const url = await getDownloadURL(storageRef);

  await updateDoc(doc(db, "sessions", code), {
    media: arrayUnion({
      url,
      path: filename,
      type,
      timestamp: new Date().toISOString(),
    }),
  });

  return url;
}
