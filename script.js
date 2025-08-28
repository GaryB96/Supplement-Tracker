document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("supplementForm");
  const calendar = document.getElementById("calendar");
  const cycleCheckbox = document.getElementById("cycleCheckbox");
  const cycleDetails = document.getElementById("cycleDetails");
  const supplementSummaryContainer = document.getElementById("supplementSummaryContainer");

  cycleCheckbox.addEventListener("change", () => {
    cycleDetails.classList.toggle("hidden", !cycleCheckbox.checked);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("nameInput").value;
    const dosage = document.getElementById("dosageInput").value;
    const time = document.getElementById("timeInput").value;
    const onCycle = cycleCheckbox.checked;
    const onDays = parseInt(document.getElementById("onDaysInput").value) || 0;
    const offDays = parseInt(document.getElementById("offDaysInput").value) || 0;

    const supplement = { name, dosage, time, onCycle, onDays, offDays };
    saveSupplement(supplement);
    renderSupplements();
    renderCalendar();
    form.reset();
    cycleDetails.classList.add("hidden");
  });

  function saveSupplement(supplement) {
    const supplements = JSON.parse(localStorage.getItem("supplements") || "[]");
    supplements.push(supplement);
    localStorage.setItem("supplements", JSON.stringify(supplements));
  }

function renderSupplements() {
  supplementSummaryContainer.innerHTML = "";
  const supplements = JSON.parse(localStorage.getItem("supplements") || "[]");

  supplements.forEach((supplement, index) => {
const box = document.createElement("div");

// Assign a cycle color class if onCycle is true
const cycleClass = supplement.onCycle ? `cycle-color-${(index % 4) + 1}` : "";

box.className = `supplement-box cycle-strip ${cycleClass}`;

    box.innerHTML = `
      <div><strong>${supplement.name}</strong></div>
      <div>Dosage: ${supplement.dosage}</div>
      <div>Time: ${supplement.time}</div>
      ${supplement.onCycle ? `<div>Cycle: ${supplement.onDays} days on / ${supplement.offDays} days off</div>` : ""}
      <div class="actions">
        <button onclick="editSupplement(${index})">Edit</button>
        <button onclick="deleteSupplement(${index})">Delete</button>
      </div>
    `;

    supplementSummaryContainer.appendChild(box);
  });
}

window.deleteSupplement = function(index) {
  const supplements = JSON.parse(localStorage.getItem("supplements") || "[]");
  supplements.splice(index, 1);
  localStorage.setItem("supplements", JSON.stringify(supplements));
  renderSupplements();
  renderCalendar();
};

window.editSupplement = function(index) {
  const supplements = JSON.parse(localStorage.getItem("supplements") || "[]");
  const supplement = supplements[index];

  document.getElementById("nameInput").value = supplement.name;
  document.getElementById("dosageInput").value = supplement.dosage;
  document.getElementById("timeInput").value = supplement.time;
  document.getElementById("cycleCheckbox").checked = supplement.onCycle;
  document.getElementById("cycleDetails").classList.toggle("hidden", !supplement.onCycle);
  document.getElementById("onDaysInput").value = supplement.onDays || "";
  document.getElementById("offDaysInput").value = supplement.offDays || "";

  supplements.splice(index, 1);
  localStorage.setItem("supplements", JSON.stringify(supplements));
  renderSupplements();
  renderCalendar();
};

  function renderSummary(supplements) {
    supplementSummaryContainer.innerHTML = "";
    supplements.forEach((supplement) => {
      const box = document.createElement("div");
      box.className = "supplement-box";
      box.innerHTML = `
        <div><strong>${supplement.name}</strong></div>
        <div>Dosage: ${supplement.dosage}</div>
        <div>Time: ${supplement.time}</div>
        ${supplement.onCycle ? `<div>Cycle: ${supplement.onDays} days on / ${supplement.offDays} days off</div>` : ""}
      `;
      supplementSummaryContainer.appendChild(box);
    });
  }

  function renderCalendar() {
    calendar.innerHTML = "";
    const supplements = JSON.parse(localStorage.getItem("supplements") || "[]");
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      const cell = document.createElement("div");
      cell.className = "day";
      cell.textContent = day;

      supplements.forEach((supplement) => {
        if (supplement.onCycle) {
          const cycleLength = supplement.onDays + supplement.offDays;
          const startDay = 1;
          const cycleDay = (day - startDay) % cycleLength;
          if (cycleDay < supplement.onDays) {
            const highlight = document.createElement("div");
            highlight.className = "highlight";
            highlight.style.backgroundColor = "#00796b";
            cell.appendChild(highlight);
          }
        }
      });

      calendar.appendChild(cell);
    }
  }

  renderSupplements();
  renderCalendar();
});
