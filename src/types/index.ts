import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  partnerCode: string;
  linkedPartnerId: string | null;
  linkedPartnerName: string | null;
  linkStatus: "unlinked" | "pending" | "linked";
  createdAt: Timestamp;
}

export type TransactionType = "income" | "expense" | "debt" | "debt_payment";

export interface Transaction {
  id?: string;
  ownerId: string;
  type: TransactionType;
  amount: number;
  category: string;
  creditorName: string | null;
  date: Timestamp;
  note: string | null;
  createdAt: Timestamp;
}

export interface FinancialSummary {
  ownerId: string;
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  totalActiveDebt: number;
}

export interface Category {
  icon: string;
  label: string;
  slug: string;
}
