document.addEventListener("DOMContentLoaded", () => {
  let supplements = JSON.parse(localStorage.getItem("supplements") || "[]");

  const form = document.getElementById("supplementForm");
  const calendar = document.getElementById("calendar");
  const calendarContainer = document.getElementById("calendarContainer");
  const cycleCheckbox = document.getElementById("cycleCheckbox");
  const cycleDetails = document.getElementById("cycleDetails");
  const supplementSummaryContainer = document.getElementById("supplementSummaryContainer");
  const currentMonthLabel = document.getElementById("currentMonthLabel");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");

  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth();

  function refreshData() {
    supplements = JSON.parse(localStorage.getItem("supplements") || "[]");
    renderSupplements();
    renderCalendar();
  }

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
    supplements.push(supplement);
    localStorage.setItem("supplements", JSON.stringify(supplements));

    refreshData();
    form.reset();
    cycleDetails.classList.add("hidden");
  });

  function renderSupplements() {
    supplementSummaryContainer.innerHTML = "";
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
          <button class="edit-btn" onclick="editSupplement(${index})">Edit</button>
          <button class="delete-btn" onclick="deleteSupplement(${index})">Delete</button>
        </div>
      `;
      supplementSummaryContainer.appendChild(box);
    });
  }

function renderCalendar() {
  calendar.innerHTML = "";

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  currentMonthLabel.textContent = `${monthName} ${currentYear}`;

  // WEEKDAY HEADER ROW
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekdayRow = document.createElement("div");
  weekdayRow.className = "weekday-row";

  weekdays.forEach(day => {
    const dayCell = document.createElement("div");
    dayCell.className = "weekday-cell";
    dayCell.textContent = day;
    weekdayRow.appendChild(dayCell);
  });

  // Add weekday row at the top
  calendar.appendChild(weekdayRow);

  // Create day grid separately
  const daysGrid = document.createElement("div");
  daysGrid.className = "days-grid";

  // EMPTY CELLS BEFORE FIRST DAY
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "day empty";
    daysGrid.appendChild(emptyCell);
  }

  // DAY CELLS
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "day";

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);

    const highlightsContainer = document.createElement("div");
    highlightsContainer.className = "highlights-container";

    supplements.forEach((supplement, index) => {
      if (supplement.onCycle) {
        const cycleLength = supplement.onDays + supplement.offDays;
        if (cycleLength > 0) {
          const cycleDay = (day - 1) % cycleLength;
          if (cycleDay < supplement.onDays) {
            const highlight = document.createElement("div");
            highlight.className = "highlight-bar";
            highlight.style.backgroundColor = getCycleColor(index);
            highlight.title = supplement.name;
            highlightsContainer.appendChild(highlight);
          }
        }
      }
    });

    cell.appendChild(highlightsContainer);
    daysGrid.appendChild(cell);
  }

  // Append the days grid under the weekday row
  calendar.appendChild(daysGrid);
}

  function getCycleColor(index) {
    const colors = ["#2196F3", "#FF9800", "#9C27B0", "#E91E63"];
    return colors[index % colors.length];
  }

  window.deleteSupplement = function(index) {
    supplements.splice(index, 1);
    localStorage.setItem("supplements", JSON.stringify(supplements));
    refreshData();
  };

  window.editSupplement = function(index) {
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
    refreshData();
  };

  prevMonthBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });

  nextMonthBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });

  refreshData();
});
