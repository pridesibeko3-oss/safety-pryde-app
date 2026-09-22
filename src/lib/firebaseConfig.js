import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDuhsGWyvVNiLFhGEiMnlm-efy0CqvX2go",
  authDomain: "safety-pryde.firebaseapp.com",
  projectId: "safety-pryde",
  storageBucket: "safety-pryde.firebasestorage.app",
  messagingSenderId: "158440398848",
  appId: "1:158440398848:web:65d1c1b15e3621b0ac38e5"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);