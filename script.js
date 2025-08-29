import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
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
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;
let supplements = [];

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("supplementForm");
  const calendar = document.getElementById("calendar");
  const calendarContainer = document.getElementById("calendarContainer");
  const cycleCheckbox = document.getElementById("cycleCheckbox");
  const cycleDetails = document.getElementById("cycleDetails");
  const supplementSummaryContainer = document.getElementById("supplementSummaryContainer");
  const currentMonthLabel = document.getElementById("currentMonthLabel");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");
  const logoutBtn = document.getElementById("logoutBtn");
  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth();

  onAuthStateChanged(auth, user => {
    if (user) {
      currentUser = user;
      document.body.classList.add("logged-in");
      refreshData();
    } else {
      currentUser = null;
      document.body.classList.remove("logged-in");
      supplements = [];
      renderSupplements();
      renderCalendar();
    }
      // 🔓 Logout logic
  logoutBtn.addEventListener("click", function () {
    try {
      alert("You have been logged out.");
      window.location.href = "index.html"; // Adjust path as needed
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Something went wrong during logout.");
    }
  });

// 🗑️ Delete account logic
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
const confirmDeleteModal = document.getElementById("confirmDeleteModal");
const confirmDeleteYes = document.getElementById("confirmDeleteYes");
const confirmDeleteNo = document.getElementById("confirmDeleteNo");

deleteAccountBtn.addEventListener("click", function () {
  confirmDeleteModal.classList.remove("hidden");
});

confirmDeleteNo.addEventListener("click", function () {
  confirmDeleteModal.classList.add("hidden");
});

confirmDeleteYes.addEventListener("click", async function () {
  try {
    // Step 1: Prompt for password
    const password = prompt("Please re-enter your password to confirm account deletion:");
    if (!password) return alert("Account deletion cancelled.");

    // Step 2: Re-authenticate
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);

    // Step 3: Delete all supplements
    const supplementsRef = collection(db, "users", currentUser.uid, "supplements");
    const snapshot = await getDocs(supplementsRef);
    const deletePromises = snapshot.docs.map(docSnap =>
      deleteDoc(doc(db, "users", currentUser.uid, "supplements", docSnap.id))
    );
    await Promise.all(deletePromises);

    // Step 4: Delete user account
    await deleteUser(currentUser);

    // Step 5: Sign out and redirect
    await signOut(auth);
    alert("Your account has been deleted.");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Account deletion failed:", error);
    if (error.code === "auth/wrong-password") {
      alert("Incorrect password. Please try again.");
    } else if (error.code === "auth/requires-recent-login") {
      alert("Please log in again before deleting your account.");
    } else {
      alert("Something went wrong: " + error.message);
    }
  }
});
});

  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      await createUserWithEmailAndPassword(auth, email, password);
    }

    loginForm.reset();
  });

  logoutBtn.addEventListener("click", () => {
    signOut(auth);
  });

  cycleCheckbox.addEventListener("change", () => {
    cycleDetails.classList.toggle("hidden", !cycleCheckbox.checked);
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const name = document.getElementById("nameInput").value;
    const dosage = document.getElementById("dosageInput").value;
    const timeCheckboxes = document.querySelectorAll(".checkbox-group input[type='checkbox']");
    const time = Array.from(timeCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value);
    const onCycle = cycleCheckbox.checked;
    const onDays = parseInt(document.getElementById("onDaysInput").value) || 0;
    const offDays = parseInt(document.getElementById("offDaysInput").value) || 0;

    const supplement = { name, dosage, time, onCycle, onDays, offDays };

    await addDoc(collection(db, "users", currentUser.uid, "supplements"), supplement);

    refreshData();
    form.reset();
    cycleDetails.classList.add("hidden");
  });

  async function refreshData() {
    const snapshot = await getDocs(collection(db, "users", currentUser.uid, "supplements"));
    supplements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderSupplements();
    renderCalendar();
  }

  function renderSupplements() {
    supplementSummaryContainer.innerHTML = "";
    supplements.forEach((supplement, index) => {
      const box = document.createElement("div");
      const cycleClass = supplement.onCycle ? `cycle-color-${(index % 4) + 1}` : "";
      box.className = `supplement-box cycle-strip ${cycleClass}`;
      box.innerHTML = `
        <div><strong>${supplement.name}</strong></div>
        <div>Dosage: ${supplement.dosage}</div>
        <div>Time: ${Array.isArray(supplement.time) && supplement.time.length ? supplement.time.join(", ") : "None selected"}</div>
        ${supplement.onCycle ? `<div>Cycle: ${supplement.onDays} days on / ${supplement.offDays} days off</div>` : ""}
        <div class="actions">
          <button class="edit-btn" onclick="editSupplement('${supplement.id}')">Edit</button>
          <button class="delete-btn" onclick="deleteSupplement('${supplement.id}')">Delete</button>
        </div>
      `;
      supplementSummaryContainer.appendChild(box);
    });
  }

  function renderCalendar() {
    calendar.innerHTML = "";

    const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" });
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    currentMonthLabel.textContent = `${monthName} ${currentYear}`;

    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const weekdayRow = document.createElement("div");
    weekdayRow.className = "weekday-row";

    weekdays.forEach(day => {
      const dayCell = document.createElement("div");
      dayCell.className = "weekday-cell";
      dayCell.textContent = day;
      weekdayRow.appendChild(dayCell);
    });

    calendar.appendChild(weekdayRow);

    const daysGrid = document.createElement("div");
    daysGrid.className = "days-grid";

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.className = "day empty";
      daysGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("div");
      cell.className = "day";

      const dayNumber = document.createElement("div");
      dayNumber.className = "day-number";
      dayNumber.textContent = day;
      cell.appendChild(dayNumber);

      const highlightsContainer = document.createElement("div");
      highlightsContainer.className = "highlights-container";

      supplements.forEach((supplement, index) => {
        if (supplement.onCycle) {
          const cycleLength = supplement.onDays + supplement.offDays;
          if (cycleLength > 0) {
            const cycleDay = (day - 1) % cycleLength;
            if (cycleDay < supplement.onDays) {
              const highlight = document.createElement("div");
              highlight.className = "highlight-bar";
              highlight.style.backgroundColor = getCycleColor(index);
              highlight.title = supplement.name;
              highlightsContainer.appendChild(highlight);
            }
          }
        }
      });

      cell.appendChild(highlightsContainer);
      daysGrid.appendChild(cell);
    }

    calendar.appendChild(daysGrid);
  }

  function getCycleColor(index) {
    const colors = ["#2196F3", "#FF9800", "#9C27B0", "#E91E63"];
    return colors[index % colors.length];
  }

  window.deleteSupplement = async function(id) {
    await deleteDoc(doc(db, "users", currentUser.uid, "supplements", id));
    refreshData();
  };

  window.editSupplement = function(id) {
    const supplement = supplements.find(s => s.id === id);

    document.getElementById("nameInput").value = supplement.name;
    document.getElementById("dosageInput").value = supplement.dosage;
    const timeCheckboxes = document.querySelectorAll(".checkbox-group input[type='checkbox']");
    timeCheckboxes.forEach(checkbox => {
      checkbox.checked = supplement.time.includes(checkbox.value);
    });
    document.getElementById("cycleCheckbox").checked = supplement.onCycle;
    document.getElementById("cycleDetails").classList.toggle("hidden", !supplement.onCycle);
    document.getElementById("onDaysInput").value = supplement.onDays || "";
    document.getElementById("offDaysInput").value = supplement.offDays || "";

    // Delete old entry before re-saving
    deleteSupplement(id);
  };

});
