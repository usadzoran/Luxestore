import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "AIzaSyCkksOEOSgRO2PJll2B56aREQNKhV7VhvU",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "studio-3236344976-c8013.firebaseapp.com",
  databaseURL: (import.meta as any).env.VITE_FIREBASE_DATABASE_URL || "https://studio-3236344976-c8013-default-rtdb.firebaseio.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "studio-3236344976-c8013",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "studio-3236344976-c8013.firebasestorage.app",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "689062563273",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:689062563273:web:d33345675e48451481ac18"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
