import React, { useState, useMemo } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { addTransaction, updateTransaction } from '../services/transactionService';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, DEBT_CATEGORIES } from '../data/categories';
import { formatInputIDR, parseIDR } from '../utils/formatCurrency';
import type { TransactionType, Transaction } from '../types';

const AddTransactionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editTransaction = location.state?.transaction as Transaction | undefined;
  const isEditMode = !!editTransaction;
  
  const { currentUser } = useAuthStore();
  
  const [type, setType] = useState<TransactionType>(editTransaction?.type || 'expense');
  const [amountDisplay, setAmountDisplay] = useState(editTransaction ? formatInputIDR(editTransaction.amount.toString()) : '');
  const [category, setCategory] = useState(editTransaction?.category || '');
  const [note, setNote] = useState(editTransaction?.note || '');
  const [creditorName, setCreditorName] = useState(editTransaction?.creditorName || '');
  const [isSaving, setIsSaving] = useState(false);

  const categories = useMemo(() => {
    if (type === 'income') return INCOME_CATEGORIES;
    if (type === 'debt' || type === 'debt_payment') return DEBT_CATEGORIES;
    return EXPENSE_CATEGORIES;
  }, [type]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputIDR(e.target.value);
    setAmountDisplay(formatted);
  };

  const handleSave = async () => {
    if (!currentUser) return;
    const amount = parseIDR(amountDisplay);
    if (amount <= 0 || !category) return;

    setIsSaving(true);
    let result;
    
    const isDebt = type === 'debt' || type === 'debt_payment';
    
    if (isEditMode && editTransaction?.id) {
      result = await updateTransaction(editTransaction.id, {
        type,
        amount,
        category,
        creditorName: isDebt ? creditorName : null,
        note
      });
    } else {
      result = await addTransaction(
        currentUser.uid,
        type,
        amount,
        category,
        isDebt ? creditorName : null,
        note
      );
    }

    if (result.success) {
      if (isEditMode) {
        navigate(-1);
      } else {
        navigate('/dashboard');
      }
    } else {
      alert(result.error);
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Transaksi' : 'Catat Transaksi'}</h1>
      </header>

      <div className="flex bg-gray-100 p-1 rounded-2xl">
        {[
          { id: 'income', label: 'Masuk' },
          { id: 'expense', label: 'Keluar' },
          { id: 'debt', label: 'Hutang' },
          { id: 'debt_payment', label: 'Bayar' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setType(t.id as TransactionType);
              setCategory('');
            }}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${
              type === t.id ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-500">Nominal</label>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-indigo-200 transition-colors">
          <span className="text-2xl font-bold text-gray-400">Rp</span>
          <input
            type="tel"
            inputMode="numeric"
            value={amountDisplay}
            onChange={handleAmountChange}
            className="w-full bg-transparent text-3xl font-bold text-gray-900 focus:outline-none"
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-semibold text-gray-500">Pilih Kategori</label>
        <div className="grid grid-cols-4 gap-y-6 gap-x-3">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setCategory(cat.slug)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-sm ${
                category === cat.slug 
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-50' 
                  : 'bg-gray-50 group-hover:bg-white group-hover:border-indigo-200 border border-transparent'
              }`}>
                {cat.icon}
              </div>
              <span className={`text-[10px] font-bold text-center leading-tight ${
                category === cat.slug ? 'text-indigo-600' : 'text-gray-500'
              }`}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {(type === 'debt' || type === 'debt_payment') && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="text-sm font-semibold text-gray-500">Nama Kreditur (Bank/Kartu)</label>
          <input
            type="text"
            value={creditorName}
            onChange={(e) => setCreditorName(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="Contoh: BCA Credit Card"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-500">Catatan (Opsional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
          placeholder="Beli apa hari ini?"
          rows={3}
        />
      </div>

      <button
        disabled={isSaving || parseIDR(amountDisplay) <= 0 || !category || ((type === 'debt' || type === 'debt_payment') && !creditorName)}
        onClick={handleSave}
        className="w-full h-14 bg-indigo-600 disabled:bg-gray-200 text-white rounded-2xl flex items-center justify-center gap-3 font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all"
      >
        {isSaving ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>
            <Save size={20} />
            <span>{isEditMode ? 'Perbarui Transaksi' : 'Simpan Transaksi'}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default AddTransactionPage;
