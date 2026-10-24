// Test debt settlement algorithm logic
function calculateSettlements(friends, expenses) {
  const balances = {};
  friends.forEach((f) => (balances[f.id] = 0));

  expenses.forEach((exp) => {
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
        from: debtor.id,
        to: creditor.id,
        amount: Math.round(settledAmount * 100) / 100
      });
    }

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount < 0.01) d++;
    if (creditor.amount < 0.01) c++;
  }

  return transactions;
}

// Simple test case: A pays 60 for A, B, C (each owes 20). B and C should pay A 20 each.
const friends = [{ id: "A" }, { id: "B" }, { id: "C" }];
const expenses = [{ paidById: "A", amount: 60, splitAmong: ["A", "B", "C"] }];
const result = calculateSettlements(friends, expenses);

console.log("Calculated Transactions:", JSON.stringify(result));
if (result.length === 2 && result.find(t => t.from === "B" && t.amount === 20) && result.find(t => t.from === "C" && t.amount === 20)) {
  console.log("PASS: Debt calculation verified!");
} else {
  console.error("FAIL: Unexpected settlement result", result);
  process.exit(1);
}