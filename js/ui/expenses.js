// Expenses & Debt Splitter UI (Multi-Trip)
export function mountExpenses(root, store) {
  const expenseList = root.querySelector("[data-expense-list]");
  const settlementList = root.querySelector("[data-settlement-list]");
  const countBadge = document.querySelector("[data-badge-expenses]");

  function calculateSettlements(activeTrip) {
    const friends = activeTrip.friends;
    const balances = {};
    friends.forEach((f) => (balances[f.id] = 0));

    activeTrip.expenses.forEach((exp) => {
      const payerId = exp.paidById;
      const totalAmount = Number(exp.amount || 0);
      const splitWith = exp.splitAmong && exp.splitAmong.length ? exp.splitAmong : friends.map((f) => f.id);
      const share = totalAmount / splitWith.length;

      if (balances[payerId] !== undefined) balances[payerId] += totalAmount;
      splitWith.forEach((fid) => {
        if (balances[fid] !== undefined) balances[fid] -= share;
      });
    });

    const debtors = [];
    const creditors = [];

    Object.entries(balances).forEach(([id, net]) => {
      const rounded = Math.round(net * 100) / 100;
      if (rounded < -0.01) debtors.push({ id, amount: -rounded });
      else if (rounded > 0.01) creditors.push({ id, amount: rounded });
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transactions = [];
    let d = 0;
    let c = 0;

    while (d < debtors.length && c < creditors.length) {
      const debtor = debtors[d];
      const creditor = creditors[c];
      const settledAmount = Math.min(debtor.amount, creditor.amount);

      if (settledAmount > 0.01) {
        transactions.push({
          from: friends.find((f) => f.id === debtor.id) || { name: "Friend", avatar: "" },
          to: friends.find((f) => f.id === creditor.id) || { name: "Friend", avatar: "" },
          amount: settledAmount
        });
      }

      debtor.amount -= settledAmount;
      creditor.amount -= settledAmount;

      if (debtor.amount < 0.01) d++;
      if (creditor.amount < 0.01) c++;
    }

    return transactions;
  }

  store.subscribe((state) => {
    const activeTrip = state.trips.find((t) => t.id === state.activeTripId) || state.trips[0];
    if (!activeTrip) return;

    if (countBadge) countBadge.textContent = activeTrip.expenses.length;

    if (activeTrip.expenses.length === 0) {
      expenseList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted); background: var(--surface-raised); border-radius: var(--radius);">
          No expenses recorded yet. Tap "+ Add Expense" to log bills, rentals, and meals.
        </div>
      `;
    } else {
      expenseList.innerHTML = activeTrip.expenses.map((exp) => {
        const payer = activeTrip.friends.find((f) => f.id === exp.paidById) || { name: "Someone", avatar: "" };
        const splitCount = exp.splitAmong ? exp.splitAmong.length : activeTrip.friends.length;
        const perPerson = (Number(exp.amount) / splitCount).toFixed(2);

        return `
          <div class="expense-item" data-id="${exp.id}">
            <div class="expense-info">
              <h4>${escapeHtml(exp.title)}</h4>
              <div class="expense-meta">
                <span>Paid by <strong>${escapeHtml(payer.name)}</strong></span>
                <span>•</span>
                <span>Split with ${splitCount}</span>
                <span>•</span>
                <span class="badge badge-blue">${exp.category || "General"}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div class="expense-amount">
                <div class="expense-price">${activeTrip.currencySymbol || "€"}${Number(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div class="expense-share">${activeTrip.currencySymbol || "€"}${perPerson}/person</div>
              </div>
              <button type="button" class="btn btn-ghost btn-sm btn-icon" data-action="delete-expense" title="Delete">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        `;
      }).join("");
    }

    const transactions = calculateSettlements(activeTrip);
    if (transactions.length === 0) {
      settlementList.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; color: var(--secondary); background: var(--secondary-tint); border-radius: var(--radius); font-size: 0.88rem;">
          🎉 All balances are even! Nobody owes anybody.
        </div>
      `;
    } else {
      settlementList.innerHTML = transactions.map((t) => `
        <div class="debt-card">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <img src="${t.from.avatar}" class="avatar" style="width: 28px; height: 28px;" alt="${t.from.name}">
            <span><strong>${escapeHtml(t.from.name)}</strong></span>
            <span class="debt-arrow">owes →</span>
            <img src="${t.to.avatar}" class="avatar" style="width: 28px; height: 28px;" alt="${t.to.name}">
            <span><strong>${escapeHtml(t.to.name)}</strong></span>
          </div>
          <div class="debt-amount">${activeTrip.currencySymbol || "€"}${t.amount.toFixed(2)}</div>
        </div>
      `).join("");
    }
  });

  expenseList.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='delete-expense']");
    if (!btn) return;
    const itemEl = btn.closest("[data-id]");
    if (!itemEl) return;
    const id = itemEl.dataset.id;
    if (confirm("Remove this expense record?")) {
      store.set((state) => ({
        trips: state.trips.map((t) => t.id === state.activeTripId ? { ...t, expenses: t.expenses.filter((x) => x.id !== id) } : t)
      }));
    }
  });
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}