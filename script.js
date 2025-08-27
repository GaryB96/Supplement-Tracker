// script.js

const supplements = [];

// Load saved supplements on page load
window.addEventListener('load', () => {
  const saved = localStorage.getItem('supplements');
  if (saved) {
    supplements.push(...JSON.parse(saved));
    renderDashboard();
  }
});

// Add a new supplement
function addSupplement(name, time) {
  const supplement = { name, time };
  supplements.push(supplement);
  localStorage.setItem('supplements', JSON.stringify(supplements));
  renderDashboard();
}

// Render the dashboard
function renderDashboard() {
  const dashboard = document.getElementById('dashboard');
  dashboard.innerHTML = '';

  supplements.forEach((supplement, index) => {
    const item = document.createElement('div');
    item.innerHTML = `
      <strong>${supplement.name}</strong> (${supplement.time})
      <button onclick="editSupplement(${index})">✏️</button>
      <button onclick="deleteSupplement(${index})">🗑️</button>
    `;
    dashboard.appendChild(item);
  });
}

// Delete a supplement
function deleteSupplement(index) {
  supplements.splice(index, 1);
  localStorage.setItem('supplements', JSON.stringify(supplements));
  renderDashboard();
}

// Edit a supplement
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

// Hook up the form
document.getElementById('supplementForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('nameInput').value.trim();
  const time = document.getElementById('timeInput').value.trim();
  if (name && time) {
    addSupplement(name, time);
    document.getElementById('supplementForm').reset();
  }
});
