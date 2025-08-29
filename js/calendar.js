// calendar.js

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function renderCalendar(month, year, supplements, calendarEl, labelEl) {
  calendarEl.innerHTML = "";

  const monthName = new Date(year, month).toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  labelEl.textContent = `${monthName} ${year}`;

  // Weekday header row
  const weekdayRow = document.createElement("div");
  weekdayRow.className = "weekday-row";
  weekdayNames.forEach(day => {
    const cell = document.createElement("div");
    cell.className = "weekday-cell";
    cell.textContent = day;
    weekdayRow.appendChild(cell);
  });
  calendarEl.appendChild(weekdayRow);

  // Day grid
  const daysGrid = document.createElement("div");
  daysGrid.className = "days-grid";

  // Empty cells before first day
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "day";
    daysGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split("T")[0];

    const dayEl = document.createElement("div");
    dayEl.className = "day";

    const numberEl = document.createElement("div");
    numberEl.className = "day-number";
    numberEl.textContent = day;
    dayEl.appendChild(numberEl);

    const supplementForDay = supplements.find(s => s.date === dateString);
    if (supplementForDay) {
      const supplementEl = document.createElement("div");
      supplementEl.className = "supplement";
      supplementEl.textContent = supplementForDay.name;

      // Apply cycle color class if available
      if (supplementForDay.colorClass) {
        supplementEl.classList.add(supplementForDay.colorClass);
      }

      dayEl.appendChild(supplementEl);
    }

    daysGrid.appendChild(dayEl);
  }

  calendarEl.appendChild(daysGrid);
}
