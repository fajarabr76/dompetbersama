import { create } from 'zustand';
import type { Transaction } from '../types';

interface TransactionState {
  myTransactions: Transaction[];
  partnerTransactions: Transaction[];
  isLoading: boolean;
  setMyTransactions: (txs: Transaction[]) => void;
  setPartnerTransactions: (txs: Transaction[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  myTransactions: [],
  partnerTransactions: [],
  isLoading: true,
  setMyTransactions: (txs) => set({ myTransactions: txs, isLoading: false }),
  setPartnerTransactions: (txs) => set({ partnerTransactions: txs, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
