// supplementUI.js
const currentUser = {
  id: "user123",
  name: "Gary",
  // Add any other properties your app expects
};
import {
  fetchSupplements,
  addSupplement,
  deleteSupplement
} from "./supplements.js";

const form = document.getElementById("supplementForm");
const cycleCheckbox = document.getElementById("cycleCheckbox");
const cycleDetails = document.getElementById("cycleDetails");
const supplementSummaryContainer = document.getElementById("supplementSummaryContainer");
const cancelEditBtn = document.getElementById("cancelEditBtn"); // Optional cancel button

let supplements = [];
let editingSupplementId = null;

cycleCheckbox.addEventListener("change", () => {
  cycleDetails.classList.toggle("hidden", !cycleCheckbox.checked);
});

form.addEventListener("submit", async e => {
  e.preventDefault();
  if (!currentUser || !currentUser.uid) return;

  const name = document.getElementById("nameInput").value;
  const dosage = document.getElementById("dosageInput").value;
  const timeCheckboxes = document.querySelectorAll(".checkbox-group input[type='checkbox']");
  const time = Array.from(timeCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
  const onCycle = cycleCheckbox.checked;
  const onDays = parseInt(document.getElementById("onDaysInput").value) || 0;
  const offDays = parseInt(document.getElementById("offDaysInput").value) || 0;

  const supplement = { name, dosage, time, onCycle, onDays, offDays };

  if (editingSupplementId) {
    await deleteSupplement(currentUser.uid, editingSupplementId);
    editingSupplementId = null;
  }

  await addSupplement(currentUser.uid, supplement);
  form.reset();
  cycleDetails.classList.add("hidden");
  await refreshData();
});

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

  cycleCheckbox.checked = supplement.onCycle;
  cycleDetails.classList.toggle("hidden", !supplement.onCycle);
  document.getElementById("onDaysInput").value = supplement.onDays || "";
  document.getElementById("offDaysInput").value = supplement.offDays || "";

  if (cancelEditBtn) cancelEditBtn.classList.remove("hidden");
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", () => {
    editingSupplementId = null;
    form.reset();
    cycleDetails.classList.add("hidden");
    cancelEditBtn.classList.add("hidden");
  });
}

async function refreshData() {
  supplements = await fetchSupplements(currentUser.uid);
  renderSupplements();
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

refreshData();
