import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBR02O8GCYAIzl5Nc4nlXrXVXCnPIrE1AE",
  authDomain: "trailer-contremaitres.firebaseapp.com",
  projectId: "trailer-contremaitres",
  storageBucket: "trailer-contremaitres.firebasestorage.app",
  messagingSenderId: "276721282605",
  appId: "1:276721282605:web:183d8afd9ca3d04b8612a4",
  measurementId: "G-R8T2X45Y6N",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;