import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCkksOEOSgRO2PJll2B56aREQNKhV7VhvU",
  authDomain: "studio-3236344976-c8013.firebaseapp.com",
  databaseURL: "https://studio-3236344976-c8013-default-rtdb.firebaseio.com",
  projectId: "studio-3236344976-c8013",
  storageBucket: "studio-3236344976-c8013.firebasestorage.app",
  messagingSenderId: "689062563273",
  appId: "1:689062563273:web:ae2dd8eadfbf6fa781ac18"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
