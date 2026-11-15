# Student Expense Tracker (Windows-friendly version)

This version uses HTML, CSS and browser JavaScript for the frontend, Node.js + Express for the backend, and a local JSON file (`expenses.json`) for persistent storage. It avoids native database compilation and therefore does not need `node-gyp` or Visual Studio C++ Build Tools.

## Requirements
- Node.js (18 or newer)
- npm

## Run on Windows / VS Code
1. Extract this ZIP.
2. Open the extracted `student-expense-tracker-fixed` folder in VS Code.
3. Open Terminal > New Terminal. Make sure the terminal path is the folder containing `package.json`.
4. If you previously tried the old version, remove its `node_modules` folder and `package-lock.json` (if present). In this fresh ZIP, those files are not included.
5. Run:

   ```powershell
   npm install
   npm start
   ```

6. Open http://localhost:3000 in your browser.

Keep the terminal running while using the website. Do not open `public/index.html` directly.

## API
- `GET /api/expenses`
- `GET /api/expenses?month=2026-11`
- `POST /api/expenses`
- `DELETE /api/expenses/:id`
- `GET /api/summary`

Expense records are stored in `expenses.json` in the project folder. Keep this file to retain your records.
