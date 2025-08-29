// calendar.js
export function renderCalendar(month, year) {
  function renderCalendar() {
    calendar.innerHTML = "";

    const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" });
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    currentMonthLabel.textContent = `${monthName} ${currentYear}`;

    const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const weekdayRow = document.createElement("div");
    weekdayRow.className = "weekday-row";

    weekdays.forEach(day => {
      const dayCell = document.createElement("div");
      dayCell.className = "weekday-cell";
      dayCell.textContent = day;
      weekdayRow.appendChild(dayCell);
    });

    calendar.appendChild(weekdayRow);

    const daysGrid = document.createElement("div");
    daysGrid.className = "days-grid";

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.className = "day empty";
      daysGrid.appendChild(emptyCell);
    }

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

    calendar.appendChild(daysGrid);
  }

  function getCycleColor(index) {
    const colors = ["#2196F3", "#FF9800", "#9C27B0", "#E91E63"];
    return colors[index % colors.length];
  }

  window.deleteSupplement = async function(id) {
    await deleteDoc(doc(db, "users", currentUser.uid, "supplements", id));
    refreshData();
  };
