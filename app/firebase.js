
// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAD8sOYbouAFDZ4FEmmi49gkMm5qDlQt0Y",
  authDomain: "eyegroup-f9694.firebaseapp.com",
  projectId: "eyegroup-f9694",
  storageBucket: "eyegroup-f9694.firebasestorage.app",
  messagingSenderId: "173097429501",
  appId: "1:173097429501:web:7e1addd1544b997a0ad194",
  measurementId: "G-18FPEJZ5LM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
