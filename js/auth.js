
// auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import { auth, db } from "./firebaseConfig.js";

export function monitorAuthState(callback) {
  onAuthStateChanged(auth, callback);
}

export async function logout() {
  await signOut(auth);
}

export async function deleteAccount(currentUser) {
  const password = prompt("Please re-enter your password to confirm account deletion:");
  if (!password) return alert("Account deletion cancelled.");

  const credential = EmailAuthProvider.credential(currentUser.email, password);
  await reauthenticateWithCredential(currentUser, credential);

  const supplementsRef = collection(db, "users", currentUser.uid, "supplements");
  const snapshot = await getDocs(supplementsRef);
  const deletePromises = snapshot.docs.map(docSnap =>
    deleteDoc(doc(db, "users", currentUser.uid, "supplements", docSnap.id))
  );
  await Promise.all(deletePromises);

  await deleteUser(currentUser);
  await logout();
}
