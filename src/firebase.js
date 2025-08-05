import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCegxngrGya9EDgNNx4Lyt454ah1z1Y7dI",
  authDomain: "mubwiza-eden.firebaseapp.com",
  projectId: "mubwiza-eden",
  storageBucket: "mubwiza-eden.firebasestorage.app",
  messagingSenderId: "95688580204",
  appId: "1:95688580204:web:d683dda472d13af94e0c49"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);