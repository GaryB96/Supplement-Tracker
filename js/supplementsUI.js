import {
  fetchSupplements,
  addSupplement,
  deleteSupplement
} from "./supplements.js";

import { renderCalendar } from "./calendar.js";

let currentUser = null;
let supplements = [];
let editingSupplementId = null;

const form = document.getElementById("supplementForm");
const cycleCheckbox = document.getElementById("cycleCheckbox");
const cycleDetails = document.getElementById("cycleDetails");
const supplementSummaryContainer = document.getElementById("supplementSummaryContainer");
const cancelEditBtn = document.getElementById("cancelEditBtn");
let calendarEl, labelEl;

document.addEventListener("DOMContentLoaded", () => {
  calendarEl = document.getElementById("calendar");
  labelEl = document.getElementById("currentMonthLabel");
});

window.addEventListener("user-authenticated", async e => {
  currentUser = e.detail;
  await refreshData();
});

if (cycleCheckbox && cycleDetails) {
  cycleCheckbox.addEventListener("change", () => {
    cycleDetails.classList.toggle("hidden", !cycleCheckbox.checked);
  });
}

if (form) {
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!currentUser || !currentUser.uid) return;

    const name = document.getElementById("nameInput").value.trim();
    const dosage = document.getElementById("dosageInput").value.trim();

    // Only capture time-of-day checkboxes, exclude the cycle checkbox
    const timeCheckboxes = document.querySelectorAll(".checkbox-group input[type='checkbox']:not(#cycleCheckbox)");
    const time = Array.from(timeCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    const onCycle = cycleCheckbox?.checked || false;
    const onDays = parseInt(document.getElementById("onDaysInput").value, 10) || 0;
    const offDays = parseInt(document.getElementById("offDaysInput").value, 10) || 0;

    const startDate = new Date().toISOString().split("T")[0]; // today's date
    const color = onCycle ? getRandomColor() : "#cccccc";

    const supplement = {
      name,
      dosage,
      time,
      startDate,
      // store a cycle object only if it's actually meaningful
      cycle: (onCycle && (onDays > 0 || offDays > 0)) ? { on: onDays, off: offDays } : null,
      color
    };

    try {
      // If editing, replace the existing one (current simple approach)
      if (editingSupplementId) {
        await deleteSupplement(currentUser.uid, editingSupplementId);
        editingSupplementId = null;
      }

      await addSupplement(currentUser.uid, supplement);

      // Reset form UI
      form.reset();
      if (cycleCheckbox) cycleCheckbox.checked = false;
      if (cycleDetails) cycleDetails.classList.add("hidden");
      timeCheckboxes.forEach(cb => cb.checked = false);
      if (cancelEditBtn) cancelEditBtn.classList.add("hidden");

      // Refresh data list AND calendar immediately
      await refreshData();
      if (typeof window.refreshCalendar === "function") {
        await window.refreshCalendar();
      }
    } catch (error) {
      console.error("❌ Failed to submit supplement:", error);
    }
  });
}

function getRandomColor() {
  const colors = ["#2196F3", "#FF9800", "#9C27B0", "#E91E63"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function editSupplement(id) {
  const supplement = supplements.find(s => s.id === id);
  if (!supplement) return;

  editingSupplementId = id;

  document.getElementById("nameInput").value = supplement.name || "";
  document.getElementById("dosageInput").value = supplement.dosage || "";

  // Only touch time-of-day checkboxes (exclude cycle checkbox)
  const timeCheckboxes = document.querySelectorAll(".checkbox-group input[type='checkbox']:not(#cycleCheckbox)");
  timeCheckboxes.forEach(cb => {
    cb.checked = Array.isArray(supplement.time) && supplement.time.includes(cb.value);
  });

  const hasCycle = !!(supplement.cycle && (Number(supplement.cycle.on) > 0 || Number(supplement.cycle.off) > 0));
  if (cycleCheckbox) cycleCheckbox.checked = hasCycle;
  if (cycleDetails) cycleDetails.classList.toggle("hidden", !hasCycle);
  document.getElementById("onDaysInput").value = hasCycle ? Number(supplement.cycle.on) : "";
  document.getElementById("offDaysInput").value = hasCycle ? Number(supplement.cycle.off) : "";

  if (cancelEditBtn) cancelEditBtn.classList.remove("hidden");
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", () => {
    editingSupplementId = null;
    form.reset();
    if (cycleCheckbox) cycleCheckbox.checked = false;
    if (cycleDetails) cycleDetails.classList.add("hidden");
    document.querySelectorAll(".checkbox-group input[type='checkbox']").forEach(cb => cb.checked = false);
    cancelEditBtn.classList.add("hidden");
  });
}

async function refreshData() {
  if (!currentUser || !currentUser.uid) {
    console.warn("⛔ currentUser is not ready yet.");
    return;
  }

  try {
    supplements = await fetchSupplements(currentUser.uid);
    renderSupplements();

    // Render calendar with current month/year and the latest supplements list
    const today = new Date();
    if (calendarEl && labelEl) {
      renderCalendar(today.getMonth(), today.getFullYear(), supplements, calendarEl, labelEl);
    }
  } catch (error) {
    console.error("❌ Failed to fetch supplements:", error);
  }
}

function renderSupplements() {
  supplementSummaryContainer.innerHTML = "";

  supplements.forEach(supplement => {
    const box = document.createElement("div");
    box.className = `supplement-box cycle-strip`;
    box.style.borderLeftColor = supplement.color || "#cccccc";

    // Only show cycle when it's actually provided and > 0
    const hasCycle =
      supplement.cycle &&
      (Number(supplement.cycle.on) > 0 || Number(supplement.cycle.off) > 0);

    const cycleInfo = hasCycle
      ? `<div>Cycle: ${Number(supplement.cycle.on)} days on / ${Number(supplement.cycle.off)} days off</div>`
      : "";

    box.innerHTML = `
      <div><strong>${supplement.name}</strong></div>
      <div>Dosage: ${supplement.dosage}</div>
      <div>Time: ${Array.isArray(supplement.time) && supplement.time.length ? supplement.time.join(", ") : "None selected"}</div>
      ${cycleInfo}
      <div class="actions">
        <button class="edit-btn" data-id="${supplement.id}">Edit</button>
        <button class="delete-btn" data-id="${supplement.id}">Delete</button>
      </div>
    `;

    supplementSummaryContainer.appendChild(box);
  });

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => editSupplement(btn.dataset.id));
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await deleteSupplement(currentUser.uid, btn.dataset.id);
      await refreshData();
      if (typeof window.refreshCalendar === "function") {
        await window.refreshCalendar();
      }
    });
  });
}
