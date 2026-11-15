const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "expenses.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readExpenses() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Could not read expenses.json:", error.message);
    return [];
  }
}

function writeExpenses(expenses) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(expenses, null, 2), "utf8");
}

app.get("/api/expenses", (req, res) => {
  let rows = readExpenses();
  const { month } = req.query;
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    rows = rows.filter(e => e.expense_date.startsWith(month));
  }
  rows.sort((a, b) => b.expense_date.localeCompare(a.expense_date) || b.id - a.id);
  res.json(rows);
});

app.post("/api/expenses", (req, res) => {
  const { title, amount, category, expense_date, note = "" } = req.body || {};
  const numericAmount = Number(amount);
  if (typeof title !== "string" || !title.trim() || !category || !expense_date ||
      !Number.isFinite(numericAmount) || numericAmount <= 0 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(expense_date)) {
    return res.status(400).json({ error: "Enter a title, valid amount, category and date." });
  }

  const expenses = readExpenses();
  const nextId = expenses.reduce((max, e) => Math.max(max, Number(e.id) || 0), 0) + 1;
  const expense = {
    id: nextId,
    title: title.trim(),
    amount: numericAmount,
    category: String(category),
    expense_date,
    note: String(note).trim()
  };
  expenses.push(expense);
  writeExpenses(expenses);
  res.status(201).json(expense);
});

app.delete("/api/expenses/:id", (req, res) => {
  const id = Number(req.params.id);
  const expenses = readExpenses();
  const updated = expenses.filter(e => e.id !== id);
  if (updated.length === expenses.length) {
    return res.status(404).json({ error: "Expense not found." });
  }
  writeExpenses(updated);
  res.json({ success: true });
});

app.get("/api/summary", (req, res) => {
  const { month } = req.query;
  let rows = readExpenses();
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    rows = rows.filter(e => e.expense_date.startsWith(month));
  }
  const total = rows.reduce((sum, e) => sum + Number(e.amount), 0);
  const byCategory = {};
  rows.forEach(e => byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount));
  res.json({ total, count: rows.length, byCategory });
});

app.listen(PORT, () => {
  console.log(`Student Expense Tracker running at http://localhost:${PORT}`);
});
