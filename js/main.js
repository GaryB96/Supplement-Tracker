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
  
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await login(email, password);
    alert("Logged in successfully!");
    window.location.href = "index.html"; // or wherever you want to go
  } catch (error) {
    console.error("Login failed:", error.message);
    alert("Login failed: " + error.message);
  }
});

signupBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signup(email, password);
    alert("Account created!");
    window.location.href = "index.html"; // or wherever you want to go
  } catch (error) {
    console.error("Signup failed:", error.message);
    alert("Signup failed: " + error.message);
  }
});
  
  logoutBtn.addEventListener("click", async () => {
    await logout();
    alert("You have been logged out.");
    window.location.href = "index.html";
  });

  deleteAccountBtn.addEventListener("click", async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      await deleteAccount(user);
      alert("Your account has been deleted.");
      window.location.href = "index.html";
    }
  });
});
