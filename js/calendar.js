// calendar.js

export function renderCalendar(month, year, supplements, calendarEl, labelEl) {
  calendarEl.innerHTML = "";

  const monthName = new Date(year, month).toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  labelEl.textContent = `${monthName} ${year}`;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split("T")[0];

    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";
    dayEl.textContent = day;

    const supplementForDay = supplements.find(s => s.date === dateString);
    if (supplementForDay) {
      const supplementEl = document.createElement("div");
      supplementEl.className = "supplement";
      supplementEl.textContent = supplementForDay.name;
      dayEl.appendChild(supplementEl);
    }

    calendarEl.appendChild(dayEl);
  }
}
