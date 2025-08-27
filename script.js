const supplements = [];
window.addEventListener('load', () => {
  const saved = localStorage.getItem('supplements');
  if (saved) {
    supplements.push(...JSON.parse(saved));
    renderDashboard();
  const item = document.createElement('div');
item.innerHTML = `
  <strong>${supplement.name}</strong> (${supplement.time})
  <button onclick="deleteSupplement(${index})">🗑️</button>
  <button onclick="editSupplement(${index})">✏️</button>
`;
  }
});

document.getElementById('cycled').addEventListener('change', function () {
  document.getElementById('cycle-details').style.display = this.checked ? 'block' : 'none';
});

document.getElementById('supplement-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const dosage = document.getElementById('dosage').value;
  const time = document.getElementById('time').value;
  const isCycled = document.getElementById('cycled').checked;
  const onDays = isCycled ? parseInt(document.getElementById('on-days').value) : null;
  const offDays = isCycled ? parseInt(document.getElementById('off-days').value) : null;

  const supplement = {
    name,
    dosage,
    timeOfDay: time,
    isCycled,
    cyclePattern: isCycled ? { onDays, offDays } : null,
    startDate: new Date().toISOString().split('T')[0] // today's date
  };

  supplements.push(supplement);
  localStorage.setItem('supplements', JSON.stringify(supplements));
  renderDashboard();
  this.reset();
  document.getElementById('cycle-details').style.display = 'none';
});

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
  const list = document.getElementById('supplement-list');
  list.innerHTML = '';

  supplements.forEach(supp => {
    const item = document.createElement('li');

    if (isSupplementActive(supp)) {
      item.textContent = `${supp.name} (${supp.dosage}) - ${supp.timeOfDay}`;
    } else {
      item.textContent = `${supp.name} is on break. Will restart on ${getNextCycleStart(supp)}.`;
      item.style.color = 'orange';
    }

    list.appendChild(item);
  });
}
document.getElementById('calendar-btn').addEventListener('click', () => {
  const calendar = document.getElementById('calendar-view');
  calendar.innerHTML = ''; // Clear previous
  calendar.style.display = 'block';

  supplements.forEach(supp => {
    const entry = document.createElement('p');
    if (supp.isCycled) {
      const nextStart = getNextCycleStart(supp);
      entry.textContent = `${supp.name}: ${supp.cyclePattern.onDays} days on / ${supp.cyclePattern.offDays} off. Next cycle starts ${nextStart}`;
    } else {
      entry.textContent = `${supp.name}: Taken daily`;
    }
    calendar.appendChild(entry);
    function deleteSupplement(index) {
  supplements.splice(index, 1);
  localStorage.setItem('supplements', JSON.stringify(supplements));
  renderDashboard();
}
    function editSupplement(index) {
  const current = supplements[index];
  const newName = prompt("Update supplement name:", current.name);
  const newTime = prompt("Update time of day:", current.time);

  if (newName && newTime) {
    supplements[index] = { name: newName, time: newTime };
    localStorage.setItem('supplements', JSON.stringify(supplements));
    renderDashboard();
  }
}
  });
});
