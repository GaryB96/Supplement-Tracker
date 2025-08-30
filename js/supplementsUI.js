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
    const startDate = new Date().toISOString().split("T")[0]; // today's date
    const color = onCycle ? getRandomColor() : "#cccccc";

    const supplement = {
      name,
      dosage,
      time,
      startDate,
      cycle: onCycle ? { on: onDays, off: offDays } : null,
      color
    };

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

      await refreshData();
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

  document.getElementById("nameInput").value = supplement.name;
  document.getElementById("dosageInput").value = supplement.dosage;

  const timeCheckboxes = document.querySelectorAll(".checkbox-group input[type='checkbox']");
  timeCheckboxes.forEach(cb => {
    cb.checked = supplement.time.includes(cb.value);
  });

  const isCycled = supplement.cycle && supplement.cycle.on > 0;
  if (cycleCheckbox) cycleCheckbox.checked = isCycled;
  if (cycleDetails) cycleDetails.classList.toggle("hidden", !isCycled);
  document.getElementById("onDaysInput").value = isCycled ? supplement.cycle.on : "";
  document.getElementById("offDaysInput").value = isCycled ? supplement.cycle.off : "";

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
    box.innerHTML = `
      <div><strong>${supplement.name}</strong></div>
      <div>Dosage: ${supplement.dosage}</div>
      <div>Time: ${supplement.time?.join(", ") || "None selected"}</div>
      ${supplement.cycle ? `<div>Cycle: ${supplement.cycle.on} days on / ${supplement.cycle.off} days off</div>` : ""}
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
