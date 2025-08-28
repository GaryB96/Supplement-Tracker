document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("supplementForm");
  const calendar = document.getElementById("calendar");
  const cycleCheckbox = document.getElementById("cycleCheckbox");
  const cycleDetails = document.getElementById("cycleDetails");
  const supplementSummaryContainer = document.getElementById("supplementSummaryContainer");
  renderSupplements();
const supplements = JSON.parse(localStorage.getItem("supplements") || "[]");
renderSummary(supplements);
  cycleCheckbox.addEventListener("change", () => {
  cycleDetails.classList.toggle("hidden", !cycleCheckbox.checked);
  });
  renderSupplements();
const supplements = JSON.parse(localStorage.getItem("supplements") || "[]");
renderSummary(supplements);
  renderCalendar();
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
const supplements = JSON.parse(localStorage.getItem("supplements") || "[]");
renderSummary(supplements);
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
  const today = new Date();
  const monthName = today.toLocaleString("default", { month: "long" });
  const calendarContainer = document.getElementById("calendarContainer");
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  // Remove previous headers if they exist
  const oldMonthHeader = calendarContainer.querySelector(".month-header");
  const oldWeekdayRow = calendarContainer.querySelector(".weekday-row");
  if (oldMonthHeader) oldMonthHeader.remove();
  if (oldWeekdayRow) oldWeekdayRow.remove();
  
  const supplements = JSON.parse(localStorage.getItem("supplements") || "[]");
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Month header
  const monthHeader = document.createElement("div");
  monthHeader.className = "month-header";
  monthHeader.textContent = `${monthName} ${year}`;
  calendarContainer.insertBefore(monthHeader, calendar);

  // Weekday headers
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdayRow = document.createElement("div");
  weekdayRow.className = "weekday-row";
  weekdays.forEach(day => {
    const dayCell = document.createElement("div");
    dayCell.className = "weekday-cell";
    dayCell.textContent = day;
    weekdayRow.appendChild(dayCell);
  });
  calendarContainer.insertBefore(weekdayRow, calendar);

  // Padding for first day of the month
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "day empty";
    calendar.appendChild(emptyCell);
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const cell = document.createElement("div");
    cell.className = "day";

    // Day number in top-left corner
    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);

    // Cycle highlights
    supplements.forEach((supplement, index) => {
      if (supplement.onCycle) {
        const cycleLength = supplement.onDays + supplement.offDays;
        const startDay = 1;
        const cycleDay = (day - startDay) % cycleLength;
        if (cycleDay < supplement.onDays) {
          const highlight = document.createElement("div");
          highlight.className = "highlight";
          highlight.style.backgroundColor = getCycleColor(index);
          cell.appendChild(highlight);
        }
      }
      console.log("Calendar rendered");
    });

    calendar.appendChild(cell);
  }
}

// Helper to match cycle color
function getCycleColor(index) {
  const colors = ["#2196F3", "#FF9800", "#9C27B0", "#E91E63"];
  return colors[index % colors.length];
}
  renderSupplements();
const supplements = JSON.parse(localStorage.getItem("supplements") || "[]");
renderSummary(supplements);
  renderCalendar();
});
