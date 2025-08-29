import { db } from "./firebaseConfig.js";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

export async function fetchSupplements(userId) {
  const supplementsRef = collection(db, "users", userId, "supplements");
  const snapshot = await getDocs(supplementsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addSupplement(userId, supplement) {
  return await addDoc(collection(db, "users", userId, "supplements"), supplement);
}

export async function deleteSupplement(userId, supplementId) {
  return await deleteDoc(doc(db, "users", userId, "supplements", supplementId));
}
