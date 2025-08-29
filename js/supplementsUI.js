import { fetchSupplements, addSupplement, deleteSupplement } from "./supplements.js";

const form = document.getElementById("supplementForm");
const cycleCheckbox = document.getElementById("cycleCheckbox");
const cycleDetails = document.getElementById("cycleDetails");
const supplementSummaryContainer = document.getElementById("supplementSummaryContainer");

let supplements = [];

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
  await addSupplement(currentUser.uid, supplement);

  form.reset();
  cycleDetails.classList.add("hidden");
  await refreshData();
});

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

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await deleteSupplement(currentUser.uid, btn.dataset.id);
      await refreshData();
    });
  });

  // You can wire up edit logic here too
}

refreshData();
  function getCycleColor(index) {
    const colors = ["#2196F3", "#FF9800", "#9C27B0", "#E91E63"];
    return colors[index % colors.length];
  }

  window.deleteSupplement = async function(id) {
    await deleteDoc(doc(db, "users", currentUser.uid, "supplements", id));
    refreshData();
  };

  window.editSupplement = function(id) {
    const supplement = supplements.find(s => s.id === id);

    document.getElementById("nameInput").value = supplement.name;
    document.getElementById("dosageInput").value = supplement.dosage;
    const timeCheckboxes = document.querySelectorAll(".checkbox-group input[type='checkbox']");
    timeCheckboxes.forEach(checkbox => {
      checkbox.checked = supplement.time.includes(checkbox.value);
    });
    document.getElementById("cycleCheckbox").checked = supplement.onCycle;
    document.getElementById("cycleDetails").classList.toggle("hidden", !supplement.onCycle);
    document.getElementById("onDaysInput").value = supplement.onDays || "";
    document.getElementById("offDaysInput").value = supplement.offDays || "";

    // Delete old entry before re-saving
    deleteSupplement(id);
  };
