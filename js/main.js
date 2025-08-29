// main.js
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

      if (!email || !password) {
        alert("Please enter both email and password.");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
      }

      try {
        await login(email, password);
        alert("Logged in successfully!");
        window.location.href = "index.html";
      } catch (loginError) {
        const errorCode = loginError.code;

        if (errorCode === "auth/wrong-password") {
          alert("Incorrect password. Please try again.");
        } else if (errorCode === "auth/user-not-found") {
          try {
            await signup(email, password);
            alert("Account created and logged in!");
            window.location.href = "index.html";
          } catch (signupError) {
            alert("Signup failed: " + signupError.message);
            console.error("Signup error:", signupError);
          }
        } else {
          alert("Login failed: " + loginError.message);
          console.error("Login error:", loginError);
        }
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
