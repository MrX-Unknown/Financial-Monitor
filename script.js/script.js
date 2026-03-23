let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let incomeDescriptions = [];
let expenseDescriptions = [];
let chart;
let editingIndex = null;

function saveData() { localStorage.setItem("transactions", JSON.stringify(transactions)); }

function rebuildSuggestions() {
  incomeDescriptions = [];
  expenseDescriptions = [];
  transactions.forEach(t => {
    if (t.type === "income" && !incomeDescriptions.includes(t.desc)) incomeDescriptions.push(t.desc);
    if (t.type === "expense" && !expenseDescriptions.includes(t.desc)) expenseDescriptions.push(t.desc);
  });
  updateSuggestions();
}

function updateSuggestions() {
  let type = document.getElementById("type").value;
  let datalist = document.getElementById("descriptionList");
  datalist.innerHTML = "";
  let list = (type === "income") ? incomeDescriptions : expenseDescriptions;
  list.forEach(desc => { let option = document.createElement("option"); option.value = desc; datalist.appendChild(option); });
}

function openTab(tabId, btn) {
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-buttons button").forEach(b => b.classList.remove("active"));
  document.getElementById(tabId).classList.add("active"); btn.classList.add("active");
  if (tabId === "history") renderHistory();
  if (tabId === "chart") { populateChartYears(); renderChart(); }
}

function getCurrentMonth() { let d = new Date(); return { month: d.getMonth(), year: d.getFullYear() }; }

function addTransaction() {
  let date = document.getElementById("date").value;
  let type = document.getElementById("type").value;
  let desc = document.getElementById("desc").value;
  let amount = parseFloat(document.getElementById("amount").value);
  if (!date || !desc || !amount) { alert("Please enter Date, Description and Amount"); return; }
  transactions.push({ date, type, desc, amount });
  saveData(); renderTable(); updateBalance(); rebuildSuggestions();
  document.getElementById("desc").value = ""; document.getElementById("amount").value = "";
  document.getElementById("date").value = new Date().toISOString().split("T")[0];
}

function editRow(i) {
  let t = transactions[i];
  document.getElementById("date").value = t.date;
  document.getElementById("type").value = t.type;
  document.getElementById("desc").value = t.desc;
  document.getElementById("amount").value = t.amount;
  transactions.splice(i, 1); saveData(); renderTable(); updateBalance(); rebuildSuggestions();
}

function deleteRow(i) {
  if (confirm("Delete this record?")) { transactions.splice(i, 1); saveData(); renderTable(); updateBalance(); rebuildSuggestions(); }
}

function editHistoryRow(actualIndex) {
  editingIndex = actualIndex;
  let t = transactions[actualIndex];
  document.getElementById("histDate").value = t.date;
  document.getElementById("histType").value = t.type;
  document.getElementById("histDesc").value = t.desc;
  document.getElementById("histAmount").value = t.amount;
  document.getElementById("historyEditContainer").style.display = "block";
}

function saveHistoryEdit() {
  if (editingIndex === null) return;
  let date = document.getElementById("histDate").value;
  let type = document.getElementById("histType").value;
  let desc = document.getElementById("histDesc").value;
  let amount = parseFloat(document.getElementById("histAmount").value);
  if (!date || !desc || !amount) { alert("Please fill all fields"); return; }
  transactions[editingIndex] = { date, type, desc, amount };
  saveData(); renderHistory(); renderTable(); updateBalance(); rebuildSuggestions();
  editingIndex = null;
  document.getElementById("historyEditContainer").style.display = "none";
  document.getElementById("histDate").value = ""; document.getElementById("histType").value = "income";
  document.getElementById("histDesc").value = ""; document.getElementById("histAmount").value = "";
}

function renderTable() {
  let body = document.getElementById("transactionBody"); body.innerHTML = "";
  let current = getCurrentMonth();
  transactions.forEach((t, i) => {
    let d = new Date(t.date);
    if (d.getMonth() === current.month && d.getFullYear() === current.year) {
      let row = document.createElement("tr");
      row.innerHTML = `<td>${t.date}</td><td class="${t.type}">${t.type}</td><td>${t.desc}</td>
      <td class="${t.type}">${t.amount.toFixed(2)}</td>
      <td><button class="edit-btn" onclick="editRow(${i})">Edit</button>
      <button class="edit-btn" onclick="deleteRow(${i})">Delete</button></td>`;
      body.appendChild(row);
    }
  });
}

function updateBalance() {
  let balance = 0; let current = getCurrentMonth();
  transactions.forEach(t => { let d = new Date(t.date); if (d.getMonth() === current.month && d.getFullYear() === current.year) { balance += t.type === "income" ? t.amount : -t.amount; } });
  document.getElementById("balance").textContent = balance.toFixed(2);
}

function renderHistory() {
  let month = parseInt(document.getElementById("historyMonth").value);
  let year = parseInt(document.getElementById("historyYear").value);
  let incomeBody = document.getElementById("historyIncome"); let expenseBody = document.getElementById("historyExpense");
  incomeBody.innerHTML = ""; expenseBody.innerHTML = "";
  let incomeTotal = 0; let expenseTotal = 0;
  transactions.forEach((t, i) => {
    let d = new Date(t.date); if (d.getMonth() === month && d.getFullYear() === year) {
      let rowHTML = `<td>${t.date}</td><td>${t.desc}</td><td>${t.amount.toFixed(2)}</td>
      <td><button class="edit-btn" onclick="editHistoryRow(${i})">Edit</button>
      <button class="edit-btn" onclick="deleteRow(${i})">Delete</button></td>`;
      let row = document.createElement("tr"); row.innerHTML = rowHTML;
      if (t.type === "income") { incomeTotal += t.amount; incomeBody.appendChild(row); }
      else { expenseTotal += t.amount; expenseBody.appendChild(row); }
    }
  });
  document.getElementById("incomeTotal").textContent = incomeTotal.toFixed(2);
  document.getElementById("expenseTotal").textContent = expenseTotal.toFixed(2);
  let remaining = incomeTotal - expenseTotal;
  let box = document.getElementById("remainingIncomeBox"); box.textContent = "Remaining Income: " + remaining.toFixed(2);
  if (remaining > 0) { box.style.background = "#d4edda"; box.style.borderLeft = "5px solid #28a745"; }
  else if (remaining < 0) { box.style.background = "#f8d7da"; box.style.borderLeft = "5px solid #dc3545"; }
  else { box.style.background = "#f0f0f0"; box.style.borderLeft = "5px solid #ccc"; }
}

function populateChartYears() {
  let years = Array.from(new Set(transactions.map(t => new Date(t.date).getFullYear())));
  let chartYear = document.getElementById("chartYear"); chartYear.innerHTML = "";
  if (years.length === 0) years = [new Date().getFullYear()];
  years.sort().forEach(y => { let option = document.createElement("option"); option.value = y; option.text = y; chartYear.appendChild(option); });
}

function renderChart() {
  let year = parseInt(document.getElementById("chartYear").value);
  let incomeData = Array(12).fill(0); let expenseData = Array(12).fill(0);
  transactions.forEach(t => { let d = new Date(t.date); if (d.getFullYear() === year) { if (t.type === "income") incomeData[d.getMonth()] += t.amount; else expenseData[d.getMonth()] += t.amount; } });
  const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: { labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [
        { label: 'Income', data: incomeData, borderColor: 'green', fill: false, tension: 0.2 },
        { label: 'Expense', data: expenseData, borderColor: 'red', fill: false, tension: 0.2 }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
  });
}

// Initialize
document.getElementById("date").value = new Date().toISOString().split("T")[0];
renderTable(); updateBalance(); rebuildSuggestions();
