import { login, signup, logout, deleteAccount, monitorAuthState, changePassword } from "./auth.js";
import { renderCalendar } from "./calendar.js";
import { fetchSupplements } from "./supplements.js";
import { EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { auth } from "./firebaseConfig.js";

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");
  const calendarEl = document.getElementById("calendar");
  const labelEl = document.getElementById("currentMonthLabel");
  const loginForm = document.getElementById("loginForm");
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");
  const profileBtn = document.getElementById("profileBtn");
  const profileDropdown = document.getElementById("profileDropdown");
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const deleteAccountLink = document.getElementById("deleteAccountLink");

  monitorAuthState(async user => {
    if (user) {
      document.body.classList.add("logged-in");
      currentUser = user;

      const event = new CustomEvent("user-authenticated", { detail: user });
      window.dispatchEvent(event);

      await refreshCalendar();
    } else {
      document.body.classList.remove("logged-in");
      calendarEl.innerHTML = "";
      labelEl.textContent = "";
    }
  });

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", async () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      await refreshCalendar();
    });

    nextBtn.addEventListener("click", async () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      await refreshCalendar();
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("emailInput").value;
      const password = document.getElementById("passwordInput").value;
      const clickedButton = e.submitter?.id;

      if (!email || !password) {
        alert("Please enter both email and password.");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
      }

      try {
        if (clickedButton === "loginBtn") {
          await login(email, password);
        } else if (clickedButton === "signupBtn") {
          await signup(email, password);
          alert("Account created and logged in!");
        } else {
          alert("Unknown action.");
          return;
        }

        window.location.href = "index.html";
      } catch (error) {
        const action = clickedButton === "loginBtn" ? "Login" : "Signup";
        alert(`${action} failed: ${error.message}`);
        console.error(`${action} error:`, error);
      }
    });
  } else {
    console.warn("loginForm not found in DOM.");
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await logout();
      alert("You have been logged out.");
      window.location.href = "index.html";
    });
  }

  if (deleteAccountBtn) {
    const modal = document.getElementById("confirmDeleteModal");
    const confirmYes = document.getElementById("confirmDeleteYes");
    const confirmNo = document.getElementById("confirmDeleteNo");

    deleteAccountBtn.addEventListener("click", () => {
      modal?.classList.remove("hidden");
    });

    confirmNo?.addEventListener("click", () => {
      modal?.classList.add("hidden");
    });

    confirmYes?.addEventListener("click", async () => {
      modal?.classList.add("hidden");

      const user = auth.currentUser;
      if (!user) {
        alert("No user is currently signed in.");
        return;
      }

      const password = prompt("Please re-enter your password to confirm deletion:");
      if (!password) {
        alert("Password is required to delete your account.");
        return;
      }

      try {
        const credential = EmailAuthProvider.credential(user.email, password);
        await user.reauthenticateWithCredential(credential);
        await deleteAccount(user);
        alert("Your account has been deleted.");
        window.location.href = "index.html";
      } catch (error) {
        alert("Account deletion failed: " + error.message);
        console.error("Delete error:", error);
      }
    });
  }
  
// Profile button dropdown toggle
const profileButton = document.getElementById("profileButton");
const profileDropdown = document.getElementById("profileDropdown");

if (profileButton) {
  // Toggle dropdown when clicking Profile
  profileButton.addEventListener("click", function (e) {
    e.stopPropagation(); // prevent closing immediately
    this.parentElement.classList.toggle("show");
  });

  // Close dropdown if clicking outside
  window.addEventListener("click", function (event) {
    if (!event.target.matches("#profileButton")) {
      document.querySelectorAll(".dropdown").forEach(dropdown => {
        dropdown.classList.remove("show");
      });
    }
  });
}

// Handle Reset Password
const resetPassword = document.getElementById("resetPassword");
if (resetPassword) {
  resetPassword.addEventListener("click", function (e) {
    e.preventDefault();
    // TODO: implement actual reset password flow
    alert("Reset Password clicked");
  });
}

// Handle Delete Account
const deleteAccount = document.getElementById("deleteAccount");
if (deleteAccount) {
  deleteAccount.addEventListener("click", function (e) {
    e.preventDefault();
    // TODO: implement actual delete account flow
    alert("Delete Account clicked");
  });
}

// 🔁 Generate all "on" dates for a supplement cycle
function generateCycleDates(startDateStr, cycle, endDateStr) {
  const dates = [];
  let current = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(current)) {
    console.warn("Invalid startDate:", startDateStr);
    return dates;
  }

  if (cycle && cycle.on === 0 && cycle.off === 0) {
    return dates;
  }

  while (current <= end) {
    for (let i = 0; i < cycle.on && current <= end; i++) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    current.setDate(current.getDate() + cycle.off);
  }

  return dates;
}

// 🌐 Expose calendar refresh globally
async function refreshCalendar() {
  if (!currentUser || !currentUser.uid) return;
  try {
    const rawSupplements = await fetchSupplements(currentUser.uid);
    const expandedSupplements = [];

    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth, 1);
    monthEnd.setDate(monthEnd.getDate() + 60); // show 60 days ahead

    for (const supp of rawSupplements) {
      if (supp.cycle && supp.startDate) {
        const cycleDates = generateCycleDates(supp.startDate, supp.cycle, monthEnd);
        for (const date of cycleDates) {
          if (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          ) {
            expandedSupplements.push({
              name: supp.name,
              date: date.toISOString().split("T")[0],
              color: supp.color || "#cccccc"
            });
          }
        }
      } else if (supp.date) {
        // fallback for one-off supplements
        const date = new Date(supp.date);
        if (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        ) {
          expandedSupplements.push({
            name: supp.name,
            date: supp.date,
            color: supp.color || "#cccccc"
          });
        }
      }
    }

    const calendarEl = document.getElementById("calendar");
    const labelEl = document.getElementById("currentMonthLabel");
    renderCalendar(currentMonth, currentYear, expandedSupplements, calendarEl, labelEl);
  } catch (error) {
    console.error("❌ Failed to fetch supplements for calendar:", error);
  }
}

window.refreshCalendar = refreshCalendar;
