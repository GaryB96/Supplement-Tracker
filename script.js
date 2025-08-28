const supplements = [];

window.addEventListener('load', () => {
  const saved = localStorage.getItem('supplements');
  if (saved) {
    supplements.push(...JSON.parse(saved));
    renderDashboard();
    renderCalendar();
    renderSupplementList();
    renderSupplementSummaries();
    console.log("Rendering supplement summaries...");
  }
});

document.getElementById('cycleCheckbox').addEventListener('change', function () {
  document.getElementById('cycleDetails').style.display = this.checked ? 'block' : 'none';
});

document.getElementById('supplementForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('nameInput').value.trim();
  const dosage = document.getElementById('dosageInput').value.trim();
  const time = document.getElementById('timeInput').value;
  const isCycled = document.getElementById('cycleCheckbox').checked;
  const onDays = isCycled ? parseInt(document.getElementById('onDaysInput').value) : null;
  const offDays = isCycled ? parseInt(document.getElementById('offDaysInput').value) : null;

  const color = getRandomColor();

  const supplement = {
    name,
    dosage,
    time,
    isCycled,
    cyclePattern: isCycled ? { onDays, offDays } : null,
    startDate: new Date().toISOString().split('T')[0],
    color
  };

  supplements.push(supplement);
  localStorage.setItem('supplements', JSON.stringify(supplements));
  renderDashboard();
  renderCalendar();
  renderSupplementList();
  renderSupplementSummaries();
  this.reset();
  document.getElementById('cycleDetails').style.display = 'none';
});

function getRandomColor() {
  const colors = ['#FF6347', '#4682B4', '#32CD32', '#FFD700', '#BA55D3', '#00CED1'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function isSupplementActive(supplement) {
  if (!supplement.isCycled) return true;

  const start = new Date(supplement.startDate);
  const today = new Date();
  const daysSinceStart = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const cycleLength = supplement.cyclePattern.onDays + supplement.cyclePattern.offDays;
  const dayInCycle = daysSinceStart % cycleLength;

  return dayInCycle < supplement.cyclePattern.onDays;
}

function getNextCycleStart(supplement) {
  const start = new Date(supplement.startDate);
  const today = new Date();
  const daysSinceStart = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const cycleLength = supplement.cyclePattern.onDays + supplement.cyclePattern.offDays;
  const dayInCycle = daysSinceStart % cycleLength;
  const daysUntilNextCycle = cycleLength - dayInCycle;
  const nextStartDate = new Date(today);
  nextStartDate.setDate(today.getDate() + daysUntilNextCycle);
  return nextStartDate.toDateString();
}

function renderDashboard() {
  const dashboard = document.getElementById('dashboard');
  dashboard.innerHTML = '';

  supplements.forEach((supp, index) => {
    const item = document.createElement('div');

    if (isSupplementActive(supp)) {
      item.innerHTML = `
        <span>${supp.name} (${supp.dosage}) - ${supp.time}</span>
        <span>
          <button onclick="editSupplement(${index})">✏️</button>
          <button onclick="deleteSupplement(${index})">🗑️</button>
        </span>
      `;
    } else {
      item.innerHTML = `
        <span>${supp.name} is on break. Will restart on ${getNextCycleStart(supp)}</span>
        <span>
          <button onclick="editSupplement(${index})">✏️</button>
          <button onclick="deleteSupplement(${index})">🗑️</button>
        </span>
      `;
      item.style.color = 'orange';
    }

    dashboard.appendChild(item);
  });
}

function renderSupplementSummaries() {
  const container = document.getElementById('supplementSummaryContainer');
  container.innerHTML = '';

  supplements.forEach((supp, index) => {
    const box = document.createElement('div');
    box.className = 'supplement-box';

    const dateAdded = new Date(supp.startDate).toDateString();
    let cycleInfo = '';

    if (supp.isCycled) {
      const nextDate = getNextCycleStart(supp);
      const active = isSupplementActive(supp);
      cycleInfo = `Cycle: ${supp.cyclePattern.onDays} on / ${supp.cyclePattern.offDays} off<br>
        Currently: ${active ? 'ON' : 'OFF'}<br>
        Next ${active ? 'OFF' : 'ON'} starts: ${nextDate}`;
    } else {
      cycleInfo = 'No cycle';
    }

    box.innerHTML = `
      <strong>${supp.name}</strong><br>
      Dosage: ${supp.dosage}<br>
      Time: ${supp.time}<br>
      Added: ${dateAdded}<br>
      ${cycleInfo}
      <div class="actions">
        <button onclick="editSupplement(${index})">✏️ Edit</button>
        <button onclick="deleteSupplement(${index})">🗑️ Delete</button>
      </div>
    `;

    container.appendChild(box);
  });
}

function deleteSupplement(index) {
  supplements.splice(index, 1);
  localStorage.setItem('supplements', JSON.stringify(supplements));
  renderDashboard();
  renderCalendar();
  renderSupplementList();
  renderSupplementSummaries();
}

function editSupplement(index) {
  const current = supplements[index];
  const newName = prompt("Update supplement name:", current.name);
  const newDosage = prompt("Update dosage:", current.dosage);
  const newTime = prompt("Update time of day:", current.time);

  if (newName && newDosage && newTime) {
    supplements[index].name = newName;
    supplements[index].dosage = newDosage;
    supplements[index].time = newTime;
    localStorage.setItem('supplements', JSON.stringify(supplements));
    renderDashboard();
    renderCalendar();
    renderSupplementList();
    renderSupplementSummaries();
  }
}

document.getElementById('viewCalendarBtn').addEventListener('click', () => {
  renderCalendar();
  renderSupplementList();
});

function renderCalendar
