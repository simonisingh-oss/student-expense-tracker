const API = "/api";
const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const monthFilter = document.getElementById("month-filter");
const money = n => new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:2 }).format(n);
const today = new Date();
document.getElementById("today").textContent = today.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
document.getElementById("expense_date").value = today.toISOString().slice(0,10);

function monthOptions() {
  const current = new Date();
  for (let i=0;i<12;i++) {
    const d = new Date(current.getFullYear(), current.getMonth()-i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const option = document.createElement("option");
    option.value = value;
    option.textContent = d.toLocaleDateString("en-IN",{month:"long",year:"numeric"});
    monthFilter.appendChild(option);
  }
}
async function request(url, options={}) {
  const response = await fetch(url, { headers:{"Content-Type":"application/json"}, ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}
async function loadDashboard() {
  const month = monthFilter.value;
  const suffix = month ? `?month=${encodeURIComponent(month)}` : "";
  const [expenses, summary] = await Promise.all([request(`${API}/expenses${suffix}`),request(`${API}/summary${suffix}`)]);
  document.getElementById("total").textContent = money(summary.total);
  document.getElementById("count").textContent = summary.count;
  document.getElementById("period-label").textContent = month ? "For selected month" : "Across all records";
  const categories = Object.entries(summary.byCategory).sort((a,b)=>b[1]-a[1]);
  document.getElementById("top-category").textContent = categories[0]?.[0] || "—";
  document.getElementById("top-category-amount").textContent = categories[0] ? money(categories[0][1]) : "No expenses yet";
  document.getElementById("records-label").textContent = `${expenses.length} record${expenses.length===1?"":"s"}`;
  renderChart(categories, summary.total);
  renderExpenses(expenses);
}
function renderChart(categories,total) {
  const chart = document.getElementById("category-chart");
  const legend = document.getElementById("legend");
  legend.innerHTML = "";
  if (!categories.length) {
    chart.className="chart-empty";
    chart.innerHTML='<div class="empty-icon">◔</div><b>No expenses to display</b><span>Add your first expense to see the breakdown.</span>';
    return;
  }
  chart.className="";
  chart.innerHTML = categories.map(([name,value]) => `<div class="bar-row"><span>${escapeHtml(name)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(2,value/total*100)}%"></div></div><span class="bar-amount">${money(value)}</span></div>`).join("");
}
function renderExpenses(expenses) {
  if (!expenses.length) {
    list.innerHTML='<tr><td colspan="5" class="empty-row">No transactions for this period.</td></tr>';
    return;
  }
  list.innerHTML=expenses.map(e=>`<tr><td>${escapeHtml(e.title)}${e.note?`<div style="font-size:9px;color:#a1a6b5;font-weight:400;margin-top:4px">${escapeHtml(e.note)}</div>`:""}</td><td><span class="category-tag">${escapeHtml(e.category)}</span></td><td>${new Date(e.expense_date+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</td><td class="amount-cell">${money(e.amount)}</td><td><button class="delete-btn" data-id="${e.id}" aria-label="Delete ${escapeHtml(e.title)}">Delete</button></td></tr>`).join("");
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
form.addEventListener("submit", async event => {
  event.preventDefault();
  const message=document.getElementById("form-message");
  const payload=Object.fromEntries(new FormData(form).entries());
  try {
    await request(`${API}/expenses`,{method:"POST",body:JSON.stringify(payload)});
    form.reset();
    document.getElementById("expense_date").value=today.toISOString().slice(0,10);
    message.textContent="Expense added successfully.";
    await loadDashboard();
  } catch(error) { message.textContent=error.message; message.style.color="#d36d6d"; }
});
list.addEventListener("click",async event=>{
  const button=event.target.closest(".delete-btn");
  if(!button)return;
  if(!confirm("Delete this expense?"))return;
  try { await request(`${API}/expenses/${button.dataset.id}`,{method:"DELETE"}); await loadDashboard(); }
  catch(error){alert(error.message);}
});
monthFilter.addEventListener("change",()=>loadDashboard().catch(showError));
function showError(error){document.getElementById("form-message").textContent=error.message;}
monthOptions();
loadDashboard().catch(showError);
