const DB_KEY = "kharchonomics:v1";
const SESSION_KEY = "kharchonomics:session";

const accountIcons = ["cash", "card", "bank", "wallet", "coins", "piggy", "briefcase", "receipt"];
const categoryIcons = ["utensils", "home", "receipt", "shirt", "heart", "fuel", "shopping", "graduation", "phone", "baby", "sparkles", "activity", "salary", "gift", "chart", "plus-circle"];
const colors = ["#ef5350", "#f2c94c", "#7e57c2", "#7bc96f", "#ec407a", "#26a69a", "#26c6da", "#f2994a", "#ad1457", "#9e9d24", "#00838f", "#2f80ed", "#6fcf97", "#bb6bd9", "#56ccf2", "#f2994a"];

const legacyIconMap = {
  "💵": "cash",
  "💳": "card",
  "🐖": "piggy",
  "💰": "wallet",
  "🏦": "bank",
  "👛": "wallet",
  "🪙": "coins",
  "🏧": "bank",
  "🍽": "utensils",
  "🏠": "home",
  "🧾": "receipt",
  "👕": "shirt",
  "🏥": "heart",
  "⛽": "fuel",
  "🛍": "shopping",
  "🎓": "graduation",
  "📱": "phone",
  "🍼": "baby",
  "💄": "sparkles",
  "🧘": "activity"
};

const state = {
  session: null,
  user: null,
  view: "records",
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
  entry: {
    type: "expense",
    amountText: "0",
    accountId: null,
    toAccountId: null,
    categoryId: null,
    notes: "",
    date: todayInput(),
    time: timeInput()
  },
  modal: null,
  searchOpen: false,
  search: ""
};

function loadDb() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) return { users: [], accounts: [], categories: [], transactions: [], budgets: [] };
  try {
    return JSON.parse(raw);
  } catch {
    return { users: [], accounts: [], categories: [], transactions: [], budgets: [] };
  }
}

function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

let db = loadDb();

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function hashPassword(email, password) {
  const data = new TextEncoder().encode(`${email.toLowerCase()}::${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0);
}

function monthName(month = state.month, year = state.year) {
  return new Date(year, month, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function sameMonth(dateText) {
  const date = new Date(dateText);
  return date.getMonth() === state.month && date.getFullYear() === state.year;
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function timeInput() {
  return new Date().toTimeString().slice(0, 5);
}

function currentUserRows(table) {
  return db[table].filter((row) => row.userId === state.user.id && !row.archived);
}

function totalsForMonth() {
  return currentUserRows("transactions")
    .filter((tx) => sameMonth(tx.date))
    .reduce((totals, tx) => {
      if (tx.type === "income") totals.income += tx.amount;
      if (tx.type === "expense") totals.expense += tx.amount;
      return totals;
    }, { income: 0, expense: 0 });
}

function accountBalance(accountId) {
  const account = db.accounts.find((item) => item.id === accountId);
  if (!account) return 0;
  return currentUserRows("transactions").reduce((balance, tx) => {
    if (tx.type === "income" && tx.accountId === accountId) return balance + tx.amount;
    if (tx.type === "expense" && tx.accountId === accountId) return balance - tx.amount;
    if (tx.type === "transfer" && tx.accountId === accountId) return balance - tx.amount;
    if (tx.type === "transfer" && tx.toAccountId === accountId) return balance + tx.amount;
    return balance;
  }, account.initialBalance);
}

function icon(name) {
  const icons = {
    menu: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
    search: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>`,
    left: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>`,
    right: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>`,
    filter: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>`,
    records: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>`,
    analysis: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 3a9 9 0 1 0 9 9h-9z"/><path d="M14 3v7h7"/></svg>`,
    budgets: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="3" width="12" height="18"/><path d="M9 7h6M9 11h2M13 11h2M9 15h2M13 15h2"/></svg>`,
    accounts: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h14a2 2 0 0 1 2 2v9H4z"/><path d="M4 7l10-3h4v3"/><path d="M15 13h5"/></svg>`,
    categories: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12 12 20 4 12V4h8z"/><circle cx="9" cy="9" r="1"/></svg>`,
    close: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
    check: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>`,
    cash: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9v.01M18 15v.01"/></svg>`,
    card: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></svg>`,
    bank: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-6 9 6"/><path d="M5 10h14M6 10v8M10 10v8M14 10v8M18 10v8M4 18h16"/></svg>`,
    wallet: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h14a3 3 0 0 1 3 3v8H4z"/><path d="M4 7l10-3h4v3"/><path d="M16 13h5"/></svg>`,
    coins: `<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="9" cy="7" rx="5" ry="3"/><path d="M4 7v7c0 1.7 2.2 3 5 3s5-1.3 5-3V7"/><path d="M14 10c2.8.2 5 1.4 5 3v4c0 1.7-2.2 3-5 3-1.5 0-2.9-.4-3.8-1"/></svg>`,
    piggy: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 11c0-3 3-5 7-5 3.8 0 7 2.2 7 5.2V16h-2l-1 3h-3l-.7-2H9l-.7 2H5l1-3c-1.7-.7-3-2.1-3-4h2z"/><path d="M16 8l2-3v4M9 9h4"/><circle cx="8" cy="11" r=".5"/></svg>`,
    briefcase: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M9 7V5h6v2M3 12h18"/></svg>`,
    utensils: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3v8M9 3v8M6 7h3M7.5 11v10"/><path d="M17 3c-2 2-3 4.5-3 8h4v10"/></svg>`,
    home: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>`,
    receipt: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>`,
    shirt: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 5 6 3 11l4 2v7h10v-7l4-2-2-5-4-2a3 3 0 0 1-6 0z"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 8c0 6-8 11-8 11S4 14 4 8a4 4 0 0 1 7-2.6A4 4 0 0 1 20 8z"/></svg>`,
    fuel: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4h9v17"/><path d="M4 21h12M8 8h3"/><path d="m14 7 4 4v7a2 2 0 0 0 4 0v-6l-3-3"/></svg>`,
    shopping: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 13H7z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>`,
    graduation: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 8 9-4 9 4-9 4z"/><path d="M7 11v5c3 2 7 2 10 0v-5"/><path d="M21 8v6"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>`,
    baby: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="10" r="5"/><path d="M8 15c1.5 2 6.5 2 8 0M9 10h.01M15 10h.01M10 13c1.2.8 2.8.8 4 0"/></svg>`,
    sparkles: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5z"/><path d="M19 3v4M17 5h4"/></svg>`,
    activity: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13h4l2-6 4 12 2-6h4"/></svg>`,
    salary: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M17 6.5c-1.2-1-3-1.5-5-1.5-2.8 0-5 1.3-5 3.5s2.2 3.1 5 3.5 5 .9 5 3.5-2.2 3.5-5 3.5c-2.1 0-4-.7-5.2-1.8"/></svg>`,
    gift: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18"/><path d="M7.5 8C5 6 6.2 3 8.5 4.2 10 5 12 8 12 8s2-3 3.5-3.8C17.8 3 19 6 16.5 8"/></svg>`,
    chart: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5"/><path d="M8 17V9M13 17V5M18 17v-6"/><path d="M4 19h17"/></svg>`,
    "plus-circle": `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>`
  };
  return icons[name] || "";
}

function appIcon(name) {
  return `<span class="app-icon">${icon(legacyIconMap[name] || name || "receipt")}</span>`;
}

function ensureSeedData() {
  const hasAccounts = db.accounts.some((row) => row.userId === state.user.id);
  migrateCurrentUserData();
  const hasIncomeCategories = db.categories.some((row) => row.userId === state.user.id && row.type === "income");
  if (hasAccounts && hasIncomeCategories) return;
  const accounts = [
    ["Cash", "cash", 1000],
    ["Daily Spending", "coins", 5000],
    ["Salary Account", "card", 29535],
    ["Saving Account", "wallet", 63495.34],
    ["Wellbeing", "bank", 24721]
  ].map(([name, iconValue, initialBalance]) => ({ id: uid("acc"), userId: state.user.id, name, icon: iconValue, initialBalance, archived: false, createdAt: new Date().toISOString() }));

  const expenseCategoryNames = ["Food", "Rent", "Bills", "Clothing", "Health", "Fuel", "Shopping", "Education", "Electronics", "Baby", "Beauty", "Wellbeing"];
  const incomeCategoryNames = ["Salary", "Bonus", "Gift", "Investment", "Other Income"];
  const expenseCategories = expenseCategoryNames.map((name, index) => ({
    id: uid("cat"),
    userId: state.user.id,
    name,
    type: "expense",
    icon: categoryIcons[index],
    color: colors[index],
    archived: false,
    createdAt: new Date().toISOString()
  }));
  const incomeCategories = incomeCategoryNames.map((name, index) => ({
    id: uid("cat"),
    userId: state.user.id,
    name,
    type: "income",
    icon: ["salary", "plus-circle", "gift", "chart", "cash"][index],
    color: ["#6fcf97", "#56ccf2", "#bb6bd9", "#2f80ed", "#f2c94c"][index],
    archived: false,
    createdAt: new Date().toISOString()
  }));

  if (!hasAccounts) db.accounts.push(...accounts);
  if (!hasIncomeCategories) db.categories.push(...incomeCategories);
  if (!db.categories.some((row) => row.userId === state.user.id && row.type === "expense")) db.categories.push(...expenseCategories);
  saveDb(db);
}

function migrateCurrentUserData() {
  let changed = false;
  db.accounts.forEach((account) => {
    if (account.userId === state.user.id && legacyIconMap[account.icon]) {
      account.icon = legacyIconMap[account.icon];
      changed = true;
    }
  });
  db.categories.forEach((category) => {
    if (category.userId === state.user.id && legacyIconMap[category.icon]) {
      category.icon = legacyIconMap[category.icon];
      changed = true;
    }
    if (category.userId === state.user.id && !category.type) {
      category.type = "expense";
      changed = true;
    }
  });
  if (!state.user.name) {
    state.user.name = state.user.email.split("@")[0];
    changed = true;
  }
  if (changed) saveDb(db);
}

function render() {
  const sessionId = localStorage.getItem(SESSION_KEY);
  state.session = sessionId;
  state.user = db.users.find((user) => user.id === sessionId) || null;
  const app = document.getElementById("app");
  if (!state.user) {
    app.innerHTML = renderAuth();
    bindAuth();
    return;
  }
  ensureSeedData();
  app.innerHTML = state.view === "entry" ? renderEntry() : renderMain();
  bindApp();
}

function renderAuth(mode = "login") {
  return `
    <section class="auth-screen">
      <form class="auth-panel" data-auth-form data-mode="${mode}">
        <h1 class="brand">Kharchonomics</h1>
        <p class="auth-copy">${mode === "login" ? "Sign in with your email and password." : "Create your private money tracker account."}</p>
        ${mode === "signup" ? `<label class="field">Name<input name="name" type="text" autocomplete="name" required /></label>` : ""}
        <label class="field">Email<input name="email" type="email" autocomplete="email" required /></label>
        <label class="field">Password<input name="password" type="password" autocomplete="${mode === "login" ? "current-password" : "new-password"}" minlength="6" required /></label>
        <p class="error" data-auth-error></p>
        <div class="auth-actions">
          <button class="primary-button" type="submit">${mode === "login" ? "Login" : "Create Account"}</button>
          <button class="link-button" type="button" data-auth-toggle>${mode === "login" ? "Create a new account" : "Already have an account"}</button>
        </div>
      </form>
    </section>
  `;
}

function renderMain() {
  const content = {
    records: renderRecords,
    analysis: renderAnalysis,
    budgets: renderBudgets,
    accounts: renderAccounts,
    categories: renderCategories
  }[state.view]();
  return `
    <section class="main-layout">
      ${renderTopbar()}
      <div class="content">${content}</div>
      ${state.view !== "analysis" ? `<button class="fab" data-action="quick-add" aria-label="Add">+</button>` : ""}
      ${renderBottomNav()}
      ${state.modal ? renderModal() : ""}
    </section>
  `;
}

function renderTopbar() {
  const totals = totalsForMonth();
  if (state.view === "accounts") {
    const accounts = currentUserRows("accounts");
    const totalBalance = accounts.reduce((sum, account) => sum + accountBalance(account.id), 0);
    const incomeSoFar = currentUserRows("transactions").filter((tx) => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
    const expenseSoFar = currentUserRows("transactions").filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);
    return `
      <header class="topbar">
        <div class="top-row"><button class="icon-button" data-action="logout" aria-label="Logout">${icon("menu")}</button><div class="header-stack"><h1 class="month-title">[ All Accounts ${money(totalBalance)} ]</h1><span>${escapeHtml(state.user.name)}</span></div><button class="icon-button" data-action="search" aria-label="Search">${icon("search")}</button></div>
        <div class="summary-row two"><div><div class="summary-label">Expense so far</div><div class="summary-value expense">${money(expenseSoFar)}</div></div><div><div class="summary-label">Income so far</div><div class="summary-value income">${money(incomeSoFar)}</div></div></div>
      </header>`;
  }
  if (state.view === "budgets") {
    const budgetTotal = currentUserRows("budgets").filter((budget) => budget.month === state.month && budget.year === state.year).reduce((sum, budget) => sum + budget.limit, 0);
    return `
      <header class="topbar">
        <div class="month-row"><button class="icon-button" data-action="prev-month">${icon("left")}</button><h1 class="month-title">${monthName()}</h1><button class="icon-button" data-action="next-month">${icon("right")}</button><span></span></div>
        <div class="summary-row two"><div><div class="summary-label">Total Budget</div><div class="summary-value">${money(budgetTotal)}</div></div><div><div class="summary-label">Total Spent</div><div class="summary-value expense">${money(totals.expense)}</div></div></div>
      </header>`;
  }
  return `
    <header class="topbar">
      <div class="top-row"><button class="icon-button" data-action="logout" aria-label="Logout">${icon("menu")}</button><div class="header-stack"><h1 class="brand">Kharchonomics</h1><span>${escapeHtml(state.user.name)}</span></div><button class="icon-button" data-action="search" aria-label="Search">${icon("search")}</button></div>
      ${state.searchOpen ? `<div class="search-panel"><input class="compact-input" data-search-input value="${escapeHtml(state.search)}" placeholder="Search records" /></div>` : ""}
      <div class="month-row"><button class="icon-button" data-action="prev-month">${icon("left")}</button><h1 class="month-title">${monthName()}</h1><button class="icon-button" data-action="next-month">${icon("right")}</button><button class="icon-button" aria-label="Filter">${icon("filter")}</button></div>
      <div class="summary-row">
        <div><div class="summary-label">Expense</div><div class="summary-value expense">${money(totals.expense)}</div></div>
        <div><div class="summary-label">Income</div><div class="summary-value income">${money(totals.income)}</div></div>
        <div><div class="summary-label">Total</div><div class="summary-value ${totals.income - totals.expense >= 0 ? "income" : "expense"}">${money(totals.income - totals.expense)}</div></div>
      </div>
    </header>`;
}

function renderRecords() {
  const transactions = currentUserRows("transactions")
    .filter((tx) => sameMonth(tx.date))
    .filter((tx) => !state.search || `${tx.notes} ${lookupAccount(tx.accountId)?.name || ""} ${lookupCategory(tx.categoryId)?.name || ""}`.toLowerCase().includes(state.search.toLowerCase()))
    .sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
  if (!transactions.length) return `<p class="empty-state">No records for ${monthName()}. Tap + to add income, expense, or transfer.</p>`;
  const grouped = transactions.reduce((group, tx) => {
    const key = new Date(tx.date).toLocaleDateString("en-IN", { month: "short", day: "2-digit", weekday: "long" });
    group[key] = group[key] || [];
    group[key].push(tx);
    return group;
  }, {});
  return Object.entries(grouped).map(([day, txs]) => `
    <section>
      <h2 class="date-heading">${day}</h2>
      ${txs.map(renderTransaction).join("")}
    </section>
  `).join("");
}

function renderTransaction(tx) {
  const account = lookupAccount(tx.accountId);
  const toAccount = lookupAccount(tx.toAccountId);
  const category = lookupCategory(tx.categoryId);
  const isTransfer = tx.type === "transfer";
  const title = isTransfer ? "Transfer" : category?.name || tx.type;
  const avatar = isTransfer ? `<span class="transfer-glyph">⇄</span>` : appIcon(category?.icon || "receipt");
  const color = isTransfer ? "#1976d2" : category?.color || "#8f2b2b";
  const subtitle = isTransfer ? `${account?.name || "Account"} → ${toAccount?.name || "Account"} "${tx.notes || ""}"` : `${account?.name || "Account"} "${tx.notes || ""}"`;
  const prefix = tx.type === "expense" ? "-" : "";
  return `
    <article class="transaction-item ${isTransfer ? "transfer-row" : ""}">
      <div class="avatar" style="background:${color}">${avatar}</div>
      <div><div class="item-title">${escapeHtml(title)}</div><div class="item-subtitle">${escapeHtml(subtitle)}</div></div>
      <div class="amount ${tx.type}">${prefix}${money(tx.amount)}</div>
    </article>`;
}

function renderAnalysis() {
  const byCategory = categoryTotals();
  const total = byCategory.reduce((sum, row) => sum + row.total, 0);
  if (!byCategory.length) return `<p class="empty-state">Analysis appears after you add expenses for ${monthName()}.</p>`;
  return `
    <div class="chart-layout">
      <button class="outline-button">Expense Overview</button>
      <div class="donut-wrap">
        <div class="donut"></div>
        <div class="legend">${byCategory.slice(0, 8).map((row) => `<div class="legend-row"><span class="swatch" style="background:${row.category.color}"></span><span>${escapeHtml(row.category.name)}</span></div>`).join("")}</div>
      </div>
      ${byCategory.map((row) => {
        const percent = total ? (row.total / total) * 100 : 0;
        return `<article class="transaction-item"><div class="avatar" style="background:${row.category.color}">${appIcon(row.category.icon)}</div><div><div class="progress-line"><span class="item-title">${escapeHtml(row.category.name)}</span><span class="amount expense">-${money(row.total)}</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(percent, 100)}%"></div></div></div><strong>${percent.toFixed(2)}%</strong></article>`;
      }).join("")}
    </div>`;
}

function renderBudgets() {
  const categories = currentUserRows("categories").filter((cat) => cat.type === "expense");
  const budgets = currentUserRows("budgets").filter((budget) => budget.month === state.month && budget.year === state.year);
  const budgetedIds = new Set(budgets.map((budget) => budget.categoryId));
  return `
    <h2 class="section-title">Budgeted categories: ${monthName()}</h2>
    ${budgets.length ? budgets.map(renderBudgetRow).join("") : `<p class="empty-state">Currently, no budget is applied for this month. Set budget-limits for this month, or copy your budget-limits from past months.</p>`}
    <h2 class="section-title">Not budgeted this month</h2>
    ${categories.filter((cat) => !budgetedIds.has(cat.id)).map((cat) => `
      <article class="category-budget-row">
        <div class="avatar" style="background:${cat.color}">${appIcon(cat.icon)}</div>
        <div class="item-title">${escapeHtml(cat.name)}</div>
        <button class="outline-button" data-action="set-budget" data-id="${cat.id}">Set Budget</button>
      </article>
    `).join("")}`;
}

function renderBudgetRow(budget) {
  const category = lookupCategory(budget.categoryId);
  const spent = currentUserRows("transactions").filter((tx) => tx.type === "expense" && tx.categoryId === budget.categoryId && sameMonth(tx.date)).reduce((sum, tx) => sum + tx.amount, 0);
  const percent = budget.limit ? Math.min((spent / budget.limit) * 100, 100) : 0;
  return `<article class="category-budget-row"><div class="avatar" style="background:${category.color}">${appIcon(category.icon)}</div><div><div class="item-title">${escapeHtml(category.name)}</div><div class="item-subtitle">${money(spent)} of ${money(budget.limit)}</div><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div></div><button class="outline-button" data-action="set-budget" data-id="${category.id}">Edit</button></article>`;
}

function renderAccounts() {
  const accounts = currentUserRows("accounts");
  return `
    ${accounts.map((account) => `<article class="account-item"><div class="avatar square">${appIcon(account.icon)}</div><div><div class="item-title">${escapeHtml(account.name)}</div><div class="item-subtitle">Balance: <span class="income">${money(accountBalance(account.id))}</span></div></div><button class="icon-button" data-action="edit-account" data-id="${account.id}" aria-label="Edit account">•••</button></article>`).join("")}
    <button class="outline-button" data-action="add-account" style="width:100%;margin-top:24px">＋ Add New Account</button>`;
}

function renderCategories() {
  return `
    <h2 class="section-title">Income Categories</h2>
    ${currentUserRows("categories").filter((cat) => cat.type === "income").map((cat) => `<article class="category-row"><div class="avatar" style="background:${cat.color}">${appIcon(cat.icon)}</div><div class="item-title">${escapeHtml(cat.name)}</div><button class="icon-button" data-action="edit-category" data-id="${cat.id}" aria-label="Edit category">•••</button></article>`).join("")}
    <h2 class="section-title">Expense Categories</h2>
    ${currentUserRows("categories").filter((cat) => cat.type === "expense").map((cat) => `<article class="category-row"><div class="avatar" style="background:${cat.color}">${appIcon(cat.icon)}</div><div class="item-title">${escapeHtml(cat.name)}</div><button class="icon-button" data-action="edit-category" data-id="${cat.id}" aria-label="Edit category">•••</button></article>`).join("")}
    <button class="outline-button" data-action="add-category" style="width:100%;margin-top:24px">＋ Add Category</button>`;
}

function renderEntry() {
  const accounts = currentUserRows("accounts");
  const categories = currentUserRows("categories").filter((cat) => cat.type === state.entry.type);
  if (!state.entry.accountId && accounts[0]) state.entry.accountId = accounts[0].id;
  if (!state.entry.toAccountId && accounts[1]) state.entry.toAccountId = accounts[1].id;
  if (!state.entry.categoryId && categories[0]) state.entry.categoryId = categories[0].id;
  return `
    <section class="entry-screen">
      <div class="entry-header"><button class="link-button text-only" data-action="cancel-entry">Cancel</button><button class="link-button text-only" data-action="save-entry">Save</button></div>
      <div class="mode-switch">${["income", "expense", "transfer"].map((type) => `<button class="mode-button ${state.entry.type === type ? "active" : ""}" data-entry-type="${type}">${type}</button>`).join("")}</div>
      <div class="picker-row">
        <button class="picker-button" data-action="choose-account">${appIcon(lookupAccount(state.entry.accountId)?.icon)} ${escapeHtml(lookupAccount(state.entry.accountId)?.name || "Account")}</button>
        ${state.entry.type === "transfer" ? `<button class="picker-button" data-action="choose-to-account">${appIcon(lookupAccount(state.entry.toAccountId)?.icon)} ${escapeHtml(lookupAccount(state.entry.toAccountId)?.name || "To Account")}</button>` : `<button class="picker-button" data-action="choose-category">${appIcon(lookupCategory(state.entry.categoryId)?.icon)} ${escapeHtml(lookupCategory(state.entry.categoryId)?.name || "Category")}</button>`}
      </div>
      <label class="field" style="margin-top:14px"><textarea data-entry-notes placeholder="Add notes">${escapeHtml(state.entry.notes)}</textarea></label>
      <div class="display-amount" data-amount-display>${escapeHtml(state.entry.amountText)}</div>
      <div class="keypad">${["+", "7", "8", "9", "-", "4", "5", "6", "×", "1", "2", "3", "÷", "0", ".", "="].map((key) => `<button class="key ${"+-×÷=".includes(key) ? "operator" : ""} ${key === "=" ? "equals" : ""}" data-key="${key}">${key}</button>`).join("")}</div>
      <div class="entry-footer"><input class="compact-input" type="date" data-entry-date value="${state.entry.date}" /><input class="compact-input" type="time" data-entry-time value="${state.entry.time}" /></div>
      ${state.modal ? renderModal() : ""}
    </section>`;
}

function renderBottomNav() {
  const tabs = [["records", "Records"], ["analysis", "Analysis"], ["budgets", "Budgets"], ["accounts", "Accounts"], ["categories", "Categories"]];
  return `<nav class="bottom-nav">${tabs.map(([id, label]) => `<button class="nav-button ${state.view === id ? "active" : ""}" data-tab="${id}">${icon(id)}<span>${label}</span></button>`).join("")}</nav>`;
}

function renderModal() {
  if (state.modal.type === "account") return renderAccountModal(state.modal.accountId);
  if (state.modal.type === "category") return renderCategoryModal(state.modal.categoryId);
  if (state.modal.type === "budget") return renderBudgetModal(state.modal.categoryId);
  if (state.modal.type === "picker") return renderPickerModal();
  return "";
}

function renderAccountModal(accountId) {
  const account = lookupAccount(accountId) || { name: "Untitled", initialBalance: 0, icon: accountIcons[0] };
  return `<div class="modal-backdrop"><form class="modal" data-account-form data-id="${accountId || ""}"><h2 class="modal-title">${accountId ? "Edit account" : "Add new account"}</h2><label class="field">Initial amount<input name="initialBalance" type="number" step="0.01" value="${account.initialBalance}" /></label><p class="item-subtitle">Initial amount will not be reflected in analysis</p><label class="field">Name<input name="name" value="${escapeHtml(account.name)}" required /></label><label class="field">Icon<div class="icon-grid">${accountIcons.map((ic) => `<button type="button" class="icon-choice ${ic === account.icon ? "active" : ""}" data-icon="${ic}">${appIcon(ic)}</button>`).join("")}</div><input type="hidden" name="icon" value="${account.icon}" /></label><div class="modal-actions"><button class="outline-button" type="button" data-action="close-modal">Cancel</button><button class="primary-button" type="submit">Save</button></div></form></div>`;
}

function renderCategoryModal(categoryId) {
  const category = lookupCategory(categoryId) || { name: "Untitled", icon: categoryIcons[0], color: colors[0], type: "expense" };
  return `<div class="modal-backdrop"><form class="modal" data-category-form data-id="${categoryId || ""}"><h2 class="modal-title">${categoryId ? "Edit category" : "Add category"}</h2><label class="field">Name<input name="name" value="${escapeHtml(category.name)}" required /></label><label class="field">Type<div class="type-toggle"><label><input type="radio" name="type" value="expense" ${category.type === "expense" ? "checked" : ""} /> Expense</label><label><input type="radio" name="type" value="income" ${category.type === "income" ? "checked" : ""} /> Income</label></div></label><label class="field">Icon<div class="icon-grid">${categoryIcons.map((ic) => `<button type="button" class="icon-choice ${ic === category.icon ? "active" : ""}" data-icon="${ic}">${appIcon(ic)}</button>`).join("")}</div><input type="hidden" name="icon" value="${category.icon}" /></label><label class="field">Color<div class="icon-grid">${colors.map((color) => `<button type="button" class="icon-choice color-choice ${color === category.color ? "active" : ""}" data-color="${color}" style="background:${color}"></button>`).join("")}</div><input type="hidden" name="color" value="${category.color}" /></label><div class="modal-actions"><button class="outline-button" type="button" data-action="close-modal">Cancel</button><button class="primary-button" type="submit">Save</button></div></form></div>`;
}

function renderBudgetModal(categoryId) {
  const category = lookupCategory(categoryId);
  const budget = currentUserRows("budgets").find((row) => row.categoryId === categoryId && row.month === state.month && row.year === state.year);
  return `<div class="modal-backdrop"><form class="modal" data-budget-form data-id="${categoryId}"><h2 class="modal-title">Set budget</h2><article class="category-row"><div class="avatar" style="background:${category.color}">${appIcon(category.icon)}</div><div class="item-title">${escapeHtml(category.name)}</div></article><label class="field">Limit<input name="limit" type="number" step="0.01" value="${budget?.limit || 0}" required /></label><p class="item-subtitle">Month: ${monthName()}</p><div class="modal-actions"><button class="outline-button" type="button" data-action="close-modal">Cancel</button><button class="primary-button" type="submit">Set</button></div></form></div>`;
}

function renderPickerModal() {
  const isCategory = state.modal.target === "category";
  const rows = isCategory ? currentUserRows("categories").filter((cat) => cat.type === state.entry.type) : currentUserRows("accounts");
  return `<div class="modal-backdrop"><div class="modal"><h2 class="modal-title">Choose ${isCategory ? "category" : "account"}</h2>${rows.map((row) => `<button class="category-row" style="width:100%;background:transparent;border-left:0;border-right:0;border-top:0;color:inherit;text-align:left" data-pick="${row.id}"><div class="avatar ${isCategory ? "" : "square"}" style="${isCategory ? `background:${row.color}` : ""}">${appIcon(row.icon)}</div><div class="item-title">${escapeHtml(row.name)}</div></button>`).join("")}<button class="outline-button" data-action="close-modal" style="width:100%;margin-top:18px">Cancel</button></div></div>`;
}

function bindAuth() {
  const form = document.querySelector("[data-auth-form]");
  document.querySelector("[data-auth-toggle]").addEventListener("click", () => {
    form.outerHTML = renderAuth(form.dataset.mode === "login" ? "signup" : "login").match(/<form[\s\S]*<\/form>/)[0];
    bindAuth();
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email")).trim().toLowerCase();
    const password = String(data.get("password"));
    const error = form.querySelector("[data-auth-error]");
    const passwordHash = await hashPassword(email, password);
    if (form.dataset.mode === "signup") {
      if (db.users.some((user) => user.email === email)) {
        error.textContent = "An account already exists for this email.";
        return;
      }
      const user = { id: uid("user"), name, email, passwordHash, createdAt: new Date().toISOString() };
      db.users.push(user);
      saveDb(db);
      localStorage.setItem(SESSION_KEY, user.id);
      render();
      return;
    }
    const user = db.users.find((item) => item.email === email && item.passwordHash === passwordHash);
    if (!user) {
      error.textContent = "Invalid email or password.";
      return;
    }
    localStorage.setItem(SESSION_KEY, user.id);
    render();
  });
}

function bindApp() {
  document.querySelectorAll("[data-tab]").forEach((button) => button.addEventListener("click", () => {
    state.view = button.dataset.tab;
    state.modal = null;
    render();
  }));
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => handleAction(button.dataset.action, button.dataset.id)));
  document.querySelectorAll("[data-entry-type]").forEach((button) => button.addEventListener("click", () => {
    state.entry.type = button.dataset.entryType;
    state.entry.categoryId = null;
    render();
  }));
  document.querySelectorAll("[data-key]").forEach((button) => button.addEventListener("click", () => pressKey(button.dataset.key)));
  document.querySelector("[data-entry-notes]")?.addEventListener("input", (event) => state.entry.notes = event.target.value);
  document.querySelector("[data-entry-date]")?.addEventListener("input", (event) => state.entry.date = event.target.value);
  document.querySelector("[data-entry-time]")?.addEventListener("input", (event) => state.entry.time = event.target.value);
  document.querySelector("[data-search-input]")?.addEventListener("input", (event) => {
    state.search = event.target.value;
    render();
  });
  document.querySelector("[data-account-form]")?.addEventListener("submit", saveAccount);
  document.querySelector("[data-category-form]")?.addEventListener("submit", saveCategory);
  document.querySelector("[data-budget-form]")?.addEventListener("submit", saveBudget);
  document.querySelectorAll("[data-icon]").forEach((button) => button.addEventListener("click", () => {
    const form = button.closest("form");
    form.elements.icon.value = button.dataset.icon;
    form.querySelectorAll("[data-icon]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  }));
  document.querySelectorAll("[data-color]").forEach((button) => button.addEventListener("click", () => {
    const form = button.closest("form");
    form.elements.color.value = button.dataset.color;
    form.querySelectorAll("[data-color]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  }));
  document.querySelectorAll("[data-pick]").forEach((button) => button.addEventListener("click", () => {
    if (state.modal.target === "account") state.entry.accountId = button.dataset.pick;
    if (state.modal.target === "toAccount") state.entry.toAccountId = button.dataset.pick;
    if (state.modal.target === "category") state.entry.categoryId = button.dataset.pick;
    state.modal = null;
    render();
  }));
}

function handleAction(action, id) {
  if (action === "logout") {
    localStorage.removeItem(SESSION_KEY);
    render();
  }
  if (action === "search") {
    state.searchOpen = !state.searchOpen;
    if (!state.searchOpen) state.search = "";
    render();
  }
  if (action === "prev-month") changeMonth(-1);
  if (action === "next-month") changeMonth(1);
  if (action === "quick-add") openEntry();
  if (action === "cancel-entry") {
    state.view = "records";
    render();
  }
  if (action === "save-entry") saveTransaction();
  if (action === "add-account") {
    state.modal = { type: "account" };
    render();
  }
  if (action === "edit-account") {
    state.modal = { type: "account", accountId: id };
    render();
  }
  if (action === "add-category") {
    state.modal = { type: "category" };
    render();
  }
  if (action === "edit-category") {
    state.modal = { type: "category", categoryId: id };
    render();
  }
  if (action === "set-budget") {
    state.modal = { type: "budget", categoryId: id };
    render();
  }
  if (action === "close-modal") {
    state.modal = null;
    render();
  }
  if (action === "choose-account") {
    state.modal = { type: "picker", target: "account" };
    render();
  }
  if (action === "choose-to-account") {
    state.modal = { type: "picker", target: "toAccount" };
    render();
  }
  if (action === "choose-category") {
    state.modal = { type: "picker", target: "category" };
    render();
  }
}

function changeMonth(delta) {
  const date = new Date(state.year, state.month + delta, 1);
  state.month = date.getMonth();
  state.year = date.getFullYear();
  render();
}

function openEntry() {
  state.entry = { type: "expense", amountText: "0", accountId: null, toAccountId: null, categoryId: null, notes: "", date: todayInput(), time: timeInput() };
  state.view = "entry";
  render();
}

function pressKey(key) {
  if (key === "=") return;
  if ("+-×÷".includes(key)) return;
  if (key === "." && state.entry.amountText.includes(".")) return;
  state.entry.amountText = state.entry.amountText === "0" && key !== "." ? key : `${state.entry.amountText}${key}`;
  const display = document.querySelector("[data-amount-display]");
  if (display) display.textContent = state.entry.amountText;
}

function saveTransaction() {
  const amount = Number(state.entry.amountText);
  if (!amount || amount < 0) return;
  db.transactions.push({
    id: uid("tx"),
    userId: state.user.id,
    type: state.entry.type,
    accountId: state.entry.accountId,
    toAccountId: state.entry.type === "transfer" ? state.entry.toAccountId : null,
    categoryId: state.entry.type === "transfer" ? null : state.entry.categoryId,
    amount,
    notes: state.entry.notes,
    date: state.entry.date,
    time: state.entry.time,
    archived: false,
    createdAt: new Date().toISOString()
  });
  saveDb(db);
  state.view = "records";
  render();
}

function saveAccount(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const existing = lookupAccount(form.dataset.id);
  const row = existing || { id: uid("acc"), userId: state.user.id, archived: false, createdAt: new Date().toISOString() };
  row.name = String(data.get("name")).trim();
  row.initialBalance = Number(data.get("initialBalance")) || 0;
  row.icon = String(data.get("icon"));
  if (!existing) db.accounts.push(row);
  saveDb(db);
  state.modal = null;
  render();
}

function saveCategory(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const existing = lookupCategory(form.dataset.id);
  const row = existing || { id: uid("cat"), userId: state.user.id, type: "expense", archived: false, createdAt: new Date().toISOString() };
  row.name = String(data.get("name")).trim();
  row.icon = String(data.get("icon"));
  row.color = String(data.get("color"));
  if (!existing) db.categories.push(row);
  saveDb(db);
  state.modal = null;
  render();
}

function saveBudget(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const limit = Number(new FormData(form).get("limit")) || 0;
  let budget = currentUserRows("budgets").find((row) => row.categoryId === form.dataset.id && row.month === state.month && row.year === state.year);
  if (!budget) {
    budget = { id: uid("budget"), userId: state.user.id, categoryId: form.dataset.id, month: state.month, year: state.year, archived: false, createdAt: new Date().toISOString() };
    db.budgets.push(budget);
  }
  budget.limit = limit;
  saveDb(db);
  state.modal = null;
  render();
}

function categoryTotals() {
  const map = new Map();
  currentUserRows("transactions").filter((tx) => tx.type === "expense" && sameMonth(tx.date)).forEach((tx) => {
    const category = lookupCategory(tx.categoryId);
    if (!category) return;
    const existing = map.get(category.id) || { category, total: 0 };
    existing.total += tx.amount;
    map.set(category.id, existing);
  });
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

function lookupAccount(id) {
  return db.accounts.find((account) => account.id === id && account.userId === state.user.id);
}

function lookupCategory(id) {
  return db.categories.find((category) => category.id === id && category.userId === state.user.id);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

render();
