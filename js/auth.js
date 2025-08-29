// auth.js

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAOsbsQ77ciIFrzKWqcoNnfg2nx4P7zRqE",
  authDomain: "supplement-tracker-bec8a.firebaseapp.com",
  projectId: "supplement-tracker-bec8a",
  storageBucket: "supplement-tracker-bec8a.appspot.com",
  messagingSenderId: "394903426941",
  appId: "1:394903426941:web:be4541048a814346005e14",
  measurementId: "G-W5ZKYC8MFT"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// 🔐 Login function
export async function login(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
    console.log("Logged in successfully");
  } catch (error) {
    console.error("Login error:", error.message);
    alert("Login failed: " + error.message);
  }
}

// 🆕 Signup function
export async function signup(email, password) {
  try {
    await auth.createUserWithEmailAndPassword(email, password);
    console.log("Signup successful");
  } catch (error) {
    console.error("Signup error:", error.message);
    alert("Signup failed: " + error.message);
  }
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
