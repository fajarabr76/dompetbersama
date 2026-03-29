import type { Transaction, FinancialSummary } from "../types";
import { isSameMonth, isSameYear } from "date-fns";

export const computeSummary = (
  transactions: Transaction[],
  ownerId: string,
  month: number,
  year: number
): FinancialSummary => {
  let currentBalance = 0;
  let monthlyIncome = 0;
  let monthlyExpense = 0;
  let totalActiveDebt = 0;

  transactions.forEach((tx) => {
    const txDate = tx.date.toDate();
    const isThisMonth = isSameMonth(txDate, new Date(year, month)) && isSameYear(txDate, new Date(year, month));

    if (tx.type === "income") {
      currentBalance += tx.amount;
      if (isThisMonth) monthlyIncome += tx.amount;
    } else if (tx.type === "expense") {
      currentBalance -= tx.amount;
      if (isThisMonth) monthlyExpense += tx.amount;
    } else if (tx.type === "debt") {
      totalActiveDebt += tx.amount;
      // Debt doesn't affect balance until it's an expense? 
      // PRD says currentBalance = Sigma income - Sigma expense
    } else if (tx.type === "debt_payment") {
      totalActiveDebt -= tx.amount;
      currentBalance -= tx.amount;
      if (isThisMonth) monthlyExpense += tx.amount; // Payment is a kind of expense
    }
  });

  return {
    ownerId,
    currentBalance,
    monthlyIncome,
    monthlyExpense,
    totalActiveDebt,
  };
};
