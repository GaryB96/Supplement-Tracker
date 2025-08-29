import { login, signup, logout, deleteAccount, monitorAuthState } from "./auth.js";
import { renderCalendar } from "./calendar.js";
import { fetchSupplements } from "./supplements.js";
import { EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { auth } from "firebaseConfig.js";

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

      // Dispatch custom event for supplementUI.js
      const event = new CustomEvent("user-authenticated", { detail: user });
      window.dispatchEvent(event);

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
    const modal = document.getElementById("confirmDeleteModal");
    const confirmYes = document.getElementById("confirmDeleteYes");
    const confirmNo = document.getElementById("confirmDeleteNo");

    deleteAccountBtn.addEventListener("click", () => {
      console.log("Delete button clicked");
      modal?.classList.remove("hidden");
    });

    confirmNo?.addEventListener("click", () => {
      console.log("Cancel delete");
      modal?.classList.add("hidden");
    });

    confirmYes?.addEventListener("click", async () => {
      modal?.classList.add("hidden");

      const user = auth.currentUser;
      if (!user) {
        alert("No user is currently signed in.");
        return;
      }

      const email = user.email;
      const password = prompt("Please re-enter your password to confirm deletion:");

      if (!password) {
        alert("Password is required to delete your account.");
        return;
      }

      try {
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
});
