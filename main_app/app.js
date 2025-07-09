// js/app.js

let customers = [];
let payments = [];
let agentEntries = [];

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(pageId).classList.remove("hidden");
}

// Load customer CSV file
function importCustomers(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result;
    customers = parseCSV(text);
    renderCustomerTable();
  };
  reader.readAsText(file);
}

// Load agent CSV file
function importAgentFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result;
    agentEntries = parseCSV(text);
    renderAgentTable();
  };
  reader.readAsText(file);
}

// Render customer table
function renderCustomerTable() {
  const tbody = document.querySelector("#customerTable tbody");
  tbody.innerHTML = "";
  customers.forEach(row => {
    const tr = document.createElement("tr");
    ["CustomerID", "Name", "Phone", "Place", "Product", "Total", "Paid", "Balance"].forEach(key => {
      const td = document.createElement("td");
      td.textContent = row[key];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

// Render agent table
function renderAgentTable() {
  const tbody = document.querySelector("#agentTable tbody");
  const summaryDiv = document.getElementById("agentSummary");
  tbody.innerHTML = "";
  let totalCollected = 0;

  agentEntries.forEach(entry => {
    const tr = document.createElement("tr");
    ["CustomerID", "Product", "Amount", "Date", "Place", "CollectedBy"].forEach(key => {
      const td = document.createElement("td");
      td.textContent = entry[key];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
    totalCollected += parseFloat(entry.Amount || 0);
  });

  summaryDiv.innerHTML = `<strong>Total Collected by Agent: ₹${totalCollected.toFixed(2)}</strong>`;
}

// Approve and update customers
function approveAgentEntries() {
  agentEntries.forEach(entry => {
    const customer = customers.find(c => c.CustomerID === entry.CustomerID);
    if (customer) {
      customer.Paid = (parseFloat(customer.Paid || 0) + parseFloat(entry.Amount || 0)).toFixed(2);
      customer.Balance = (parseFloat(customer.Total || 0) - parseFloat(customer.Paid)).toFixed(2);

      payments.push({
        CustomerID: entry.CustomerID,
        Product: entry.Product,
        Amount: entry.Amount,
        Date: entry.Date,
        CollectedBy: entry.CollectedBy,
        Place: entry.Place
      });
    }
  });

  alert("Agent entries approved and customer data updated.");
  renderCustomerTable();
}

// Export updated CSVs
function exportFiles() {
  downloadCSV(customers, "customers.csv");
  downloadCSV(payments, "payments.csv");
}

// CSV utils
function parseCSV(text) {
  const [headerLine, ...lines] = text.trim().split("\n");
  const headers = headerLine.split(",");
  return lines.map(line => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim());
    return obj;
  });
}

function downloadCSV(data, filename) {
  const headers = Object.keys(data[0] || {});
  const rows = data.map(row => headers.map(h => row[h]).join(","));
  const csv = [headers.join(","), ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function searchCustomer(query) {
  const q = query.toLowerCase();
  const filtered = customers.filter(c =>
    c.CustomerID?.toLowerCase().includes(q) ||
    c.Name?.toLowerCase().includes(q) ||
    c.Phone?.includes(q) ||
    c.Place?.toLowerCase().includes(q)
  );

  const tbody = document.querySelector("#customerTable tbody");
  tbody.innerHTML = "";
  filtered.forEach(row => {
    const tr = document.createElement("tr");
    ["CustomerID", "Name", "Phone", "Place", "Product", "Total", "Paid", "Balance"].forEach(key => {
      const td = document.createElement("td");
      td.textContent = row[key];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}
