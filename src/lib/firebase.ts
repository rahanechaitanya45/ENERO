import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCQnFjCpkIEDecpVbx3-OZkTjBptumnLYs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "enero-9837b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "enero-9837b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "enero-9837b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "786157895096",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:786157895096:web:8fb17347bb89305426a34d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-E5NLLRD1SV"
};

// Initialize Firebase once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
