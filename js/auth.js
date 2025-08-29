const firebaseConfig = {
  apiKey: "AIzaSyAOsbsQ77ciIFrzKWqcoNnfg2nx4P7zRqE",
  authDomain: "supplement-tracker-bec8a.firebaseapp.com",
  projectId: "supplement-tracker-bec8a",
  storageBucket: "supplement-tracker-bec8a.firebasestorage.app",
  messagingSenderId: "394903426941",
  appId: "1:394903426941:web:be4541048a814346005e14",
  measurementId: "G-W5ZKYC8MFT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔐 Login function
export async function login(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in successfully");
  } catch (error) {
    console.error("Login error:", error.message);
    alert("Login failed: " + error.message);
  }
}

// 🆕 Signup function
export async function signup(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    console.log("Signup successful");
  } catch (error) {
    console.error("Signup error:", error.message);
    alert("Signup failed: " + error.message);
  }
}

// 👀 Monitor auth state
export function monitorAuthState(callback) {
  onAuthStateChanged(auth, user => {
    callback(user);
  });
}

// 🚪 Optional: Logout function
export async function logout() {
  try {
    await signOut(auth);
    console.log("Logged out");
  } catch (error) {
    console.error("Logout error:", error.message);
  }
}
