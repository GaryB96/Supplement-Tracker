// main.js
import { monitorAuthState, logout, deleteAccount } from "./auth.js";
import { renderCalendar } from "./calendar.js";

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");

  monitorAuthState(user => {
    if (user) {
      document.body.classList.add("logged-in");
      renderCalendar(new Date().getMonth(), new Date().getFullYear());
    } else {
      document.body.classList.remove("logged-in");
    }
  });

  logoutBtn.addEventListener("click", async () => {
    await logout();
    alert("You have been logged out.");
    window.location.href = "index.html";
  });

  deleteAccountBtn.addEventListener("click", async () => {
    await deleteAccount(auth.currentUser);
    alert("Your account has been deleted.");
    window.location.href = "index.html";
  });
});
