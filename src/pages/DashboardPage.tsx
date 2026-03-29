import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useTransactionStore } from '../stores/transactionStore';
import { useTransactions } from '../hooks/useTransactions';
import { computeSummary } from '../utils/computeAggregation';
import { formatIDR } from '../utils/formatCurrency';
import { getCategoryIcon } from '../utils/categoryMeta';
import { Link, useNavigate } from 'react-router-dom';
import TransactionActionModal from '../components/ui/TransactionActionModal';
import InitialBalanceModal from '../components/ui/InitialBalanceModal';
import { deleteTransaction } from '../services/transactionService';
import { updateInitialBalance } from '../services/userService';
import type { Transaction } from '../types';

const DashboardPage: React.FC = () => {
  useTransactions(); // Initialize real-time listeners
  const navigate = useNavigate();
  const { currentUser, firebaseUser, partnerInitialBalance, setUser } = useAuthStore();
  const { myTransactions, partnerTransactions, isLoading } = useTransactionStore();
  const [viewMode, setViewMode] = useState<'pribadi' | 'pasangan'>('pribadi');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveInitialBalance = async (balance: number) => {
    if (!currentUser || !firebaseUser) return;
    const result = await updateInitialBalance(currentUser.uid, balance);
    if (result.success) {
      setUser({ ...currentUser, initialBalance: balance }, firebaseUser);
    } else {
      alert(result.error);
    }
  };

  const activeTransactions = useMemo(() => {
    return viewMode === 'pribadi' ? myTransactions : partnerTransactions;
  }, [viewMode, myTransactions, partnerTransactions]);

  const summary = useMemo(() => {
    const now = new Date();
    const initialBalance = viewMode === 'pribadi' 
      ? (currentUser?.initialBalance ?? 0) 
      : (currentUser?.initialBalance ?? 0) + partnerInitialBalance;

    return computeSummary(
      activeTransactions,
      viewMode === 'pribadi' ? currentUser?.uid || '' : currentUser?.linkedPartnerId || '',
      now.getMonth(),
      now.getFullYear(),
      initialBalance
    );
  }, [activeTransactions, viewMode, currentUser, partnerInitialBalance]);

  const recentTransactions = useMemo(() => {
    return activeTransactions.slice(0, 5);
  }, [activeTransactions]);

  if (isLoading && activeTransactions.length === 0) {
    return (
      <div className="p-4 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-3xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('pribadi')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'pribadi' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'
            }`}
          >
            Pribadi
          </button>
          <button
            disabled={!currentUser?.linkedPartnerId}
            onClick={() => setViewMode('pasangan')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'pasangan' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 disabled:opacity-50'
            }`}
          >
            Pasangan
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Total Saldo', amount: summary.currentBalance, color: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
          { label: 'Masuk Bulan Ini', amount: summary.monthlyIncome, color: 'bg-green-50 border-green-100 text-green-600' },
          { label: 'Keluar Bulan Ini', amount: summary.monthlyExpense, color: 'bg-red-50 border-red-100 text-red-600' },
          { label: 'Total Hutang', amount: summary.totalActiveDebt, color: 'bg-orange-50 border-orange-100 text-orange-600' },
        ].map((card, i) => (
          <div key={i} className={`p-4 rounded-3xl border ${card.color.split(' ').slice(0, 2).join(' ')}`}>
            <span className="text-xs font-semibold text-gray-500 block mb-1">{card.label}</span>
            <span className={`text-lg font-bold ${card.color.split(' ')[2]}`}>{formatIDR(card.amount)}</span>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Transaksi Terbaru</h2>
          <Link to="/history" className="text-sm font-semibold text-indigo-600">Lihat Semua</Link>
        </div>
        
        <div className="space-y-3 pb-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => { setSelectedTransaction(tx); setIsModalOpen(true); }}
              >
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl">
                  {getCategoryIcon(tx.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{tx.category}</p>
                  <p className="text-xs text-gray-400 italic truncate">{tx.note || 'No note'}</p>
                </div>
                <p className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatIDR(tx.amount).replace('Rp ', '')}
                </p>
              </div>
            ))
          ) : (
            <div className="py-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm font-medium">Belum ada transaksi</p>
              <Link to="/add" className="text-indigo-600 font-bold text-sm mt-2 block">Catat Sekarang</Link>
            </div>
          )}
        </div>
      </section>

      <TransactionActionModal
        isOpen={isModalOpen}
        transaction={selectedTransaction}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTransaction(null);
        }}
        onEdit={() => {
          setIsModalOpen(false);
          navigate('/add', { state: { transaction: selectedTransaction } });
        }}
        onDeleteConfirm={async () => {
          if (selectedTransaction?.id) {
            await deleteTransaction(selectedTransaction.id);
            setIsModalOpen(false);
            setSelectedTransaction(null);
          }
        }}
      />

      <InitialBalanceModal
        isOpen={currentUser !== null && (currentUser.initialBalance === undefined || currentUser.initialBalance === null)}
        onSave={handleSaveInitialBalance}
      />
    </div>
  );
};

export default DashboardPage;
