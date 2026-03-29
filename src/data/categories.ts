import type { Category } from "../types";

export const EXPENSE_CATEGORIES: Category[] = [
  { icon: '🍜', label: 'Makan & Minum', slug: 'food' },
  { icon: '🚗', label: 'Transportasi', slug: 'transport' },
  { icon: '🛒', label: 'Belanja', slug: 'shopping' },
  { icon: '💊', label: 'Kesehatan', slug: 'health' },
  { icon: '🎮', label: 'Hiburan', slug: 'entertainment' },
  { icon: '🏠', label: 'Rumah Tangga', slug: 'household' },
  { icon: '📦', label: 'Lainnya', slug: 'other_expense' },
];

export const INCOME_CATEGORIES: Category[] = [
  { icon: '💼', label: 'Gaji', slug: 'salary' },
  { icon: '📈', label: 'Investasi', slug: 'investment' },
  { icon: '🎁', label: 'Bonus', slug: 'bonus' },
  { icon: '💰', label: 'Usaha', slug: 'business' },
  { icon: '📦', label: 'Lainnya', slug: 'other_income' },
];

export const DEBT_CATEGORIES: Category[] = [
  { icon: '💳', label: 'Kartu Kredit', slug: 'credit_card' },
  { icon: '🏠', label: 'KPR', slug: 'mortgage' },
  { icon: '🚗', label: 'Kredit Kendaraan', slug: 'vehicle_loan' },
  { icon: '🏦', label: 'Pinjaman Bank', slug: 'bank_loan' },
  { icon: '📦', label: 'Lainnya', slug: 'other_debt' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, ...DEBT_CATEGORIES];
