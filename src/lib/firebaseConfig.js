// ============================================================================
// FIREBASE SETUP — do this once, from any browser, no laptop needed.
// ============================================================================
// 1. Go to https://console.firebase.google.com on your phone or any computer.
// 2. Create a project (free "Spark" plan is enough to start).
// 3. In the project, go to Build > Firestore Database > Create database
//    (start in "production mode", pick a region close to South Africa,
//    e.g. europe-west1 or a nearby region Firebase offers).
// 4. Go to Build > Storage > Get started (for photos/video).
// 5. Go to Project settings (gear icon) > General > "Your apps" > Add app >
//    Web app (</>) — even though this is an Android app, Firebase JS SDK
//    uses the web app config. Copy the config object it gives you and
//    paste the values below.
// 6. Go to Build > Authentication > Sign-in method > enable "Anonymous".
//    This lets the app create a lightweight identity for each session
//    without her or her contact needing to make an account.
// ============================================================================

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
 const firebaseConfig = {
  apiKey: "AIzaSyDuhsGWyvVNiLFhGEiMnlm-efy0CqvX2go",
  authDomain: "safety-pryde.firebaseapp.com",
  projectId: "safety-pryde",
  storageBucket: "safety-pryde.firebasestorage.app",
  messagingSenderId: "158440398848",
  appId: "1:158440398848:web:65d1c1b15e3621b0ac38e5"
};
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
