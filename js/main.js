import { login, signup, logout, deleteAccount, monitorAuthState } from "./auth.js";
import { renderCalendar } from "./calendar.js";
import { fetchSupplements } from "./supplements.js";

const auth = firebase.auth();

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");
  const calendarEl = document.getElementById("calendar");
  const labelEl = document.getElementById("currentMonthLabel");
  const loginForm = document.getElementById("loginForm");

  // 🔐 Monitor auth state
  monitorAuthState(async user => {
    if (user) {
      document.body.classList.add("logged-in");

      const supplements = await fetchSupplements(user.uid);
      const now = new Date();
      renderCalendar(now.getMonth(), now.getFullYear(), supplements, calendarEl, labelEl);
    } else {
      document.body.classList.remove("logged-in");
      calendarEl.innerHTML = "";
      labelEl.textContent = "";
    }
  });

  // 🔑 Handle login/signup form
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
          alert("Logged in successfully!");
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

  // 🚪 Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await logout();
      alert("You have been logged out.");
      window.location.href = "index.html";
    });
  }

  // 🧨 Delete account
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", async () => {
      const user = auth.currentUser;
      if (user) {
        await deleteAccount(user);
        alert("Your account has been deleted.");
        window.location.href = "index.html";
      }
    });
  }
});
