// supplements.js
import { db } from "./firebaseConfig.js";
import { collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

export async function fetchSupplements(userId) {
  const supplementsRef = collection(db, "users", userId, "supplements");
  const snapshot = await getDocs(supplementsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
