// auth.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAOsbsQ77ciIFrzKWqcoNnfg2nx4P7zRqE",
  authDomain: "supplement-tracker-bec8a.firebaseapp.com",
  projectId: "supplement-tracker-bec8a",
  storageBucket: "supplement-tracker-bec8a.appspot.com",
  messagingSenderId: "394903426941",
  appId: "1:394903426941:web:be4541048a814346005e14",
  measurementId: "G-W5ZKYC8MFT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

// 🔐 Login function
export async function login(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

// 🆕 Signup function
export async function signup(email, password) {
  return auth.createUserWithEmailAndPassword(email, password);
}

// 👀 Monitor auth state
export function monitorAuthState(callback) {
  auth.onAuthStateChanged(user => {
    callback(user);
  });
}

// 🚪 Logout function
export async function logout() {
  try {
    await auth.signOut();
    console.log("Logged out");
  } catch (error) {
    console.error("Logout error:", error.message);
  }
}

// 🗑️ Delete account
export async function deleteAccount(user) {
  try {
    await user.delete();
    console.log("Account deleted");
  } catch (error) {
    console.error("Delete error:", error.message);
    alert("Failed to delete account: " + error.message);
  }
}

export { auth, db }; // ✅ Export both auth and db
