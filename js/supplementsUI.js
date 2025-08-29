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

    const name = document.getElementById("nameInput").value;
    const dosage = document.getElementById("dosageInput").value;
    const timeCheckboxes = document.querySelectorAll(".checkbox-group input[type='checkbox']");
    const time = Array.from(timeCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    const onCycle = cycleCheckbox?.checked || false;
    const onDays = parseInt(document.getElementById("onDaysInput").value) || 0;
    const offDays = parseInt(document.getElementById("offDaysInput").value) || 0;
    const colorClass = onCycle ? `cycle-color-${(Math.floor(Math.random() * 4) + 1)}` : "";
    const date = new Date().toISOString().split("T")[0]; // Use today's date

    const supplement = { name, dosage, time, onCycle, onDays, offDays, colorClass, date };

    try {
      if (editingSupplementId) {
        await deleteSupplement(currentUser.uid, editingSupplementId);
        editingSupplementId = null;
      }

      await addSupplement(currentUser.uid, supplement);
      form.reset();

      if (cycleCheckbox) cycleCheckbox.checked = false;
      if (cycleDetails) cycleDetails.classList.add("hidden");
      timeCheckboxes.forEach(cb => cb.checked = false);
      if (cancelEditBtn) cancelEditBtn.classList.add("hidden");

      await refreshData(); // This now also updates the calendar
    } catch (error) {
      console.error("❌ Failed to submit supplement:", error);
    }
  });
}

function editSupplement(id) {
  const supplement = supplements.find(s => s.id === id);
  if (!supplement) return;

  editingSupplementId = id;

  document.getElementById("nameInput").value = supplement.name;
  document.getElementById("dosageInput").value = supplement.dosage;

  const timeCheckboxes = document.querySelectorAll(".checkbox-group input[type='checkbox']");
  timeCheckboxes.forEach(cb => {
    cb.checked = supplement.time.includes(cb.value);
  });

  if (cycleCheckbox) cycleCheckbox.checked = supplement.onCycle;
  if (cycleDetails) cycleDetails.classList.toggle("hidden", !supplement.onCycle);
  document.getElementById("onDaysInput").value = supplement.onDays || "";
  document.getElementById("offDaysInput").value = supplement.offDays || "";

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
    const today = new Date();
    if (calendarEl && labelEl) {
  const today = new Date();
  renderCalendar(today.getMonth(), today.getFullYear(), supplements, calendarEl, labelEl);
}
    renderCalendar(today.getMonth(), today.getFullYear(), supplements, calendarEl, labelEl);
  } catch (error) {
    console.error("❌ Failed to fetch supplements:", error);
  }
}

function renderSupplements() {
  supplementSummaryContainer.innerHTML = "";
  supplements.forEach(supplement => {
    const box = document.createElement("div");
    const cycleClass = supplement.colorClass || "";
    box.className = `supplement-box cycle-strip ${cycleClass}`;
    box.innerHTML = `
      <div><strong>${supplement.name}</strong></div>
      <div>Dosage: ${supplement.dosage}</div>
      <div>Time: ${supplement.time?.join(", ") || "None selected"}</div>
      ${supplement.onCycle ? `<div>Cycle: ${supplement.onDays} days on / ${supplement.offDays} days off</div>` : ""}
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
    });
  });
}
