import React, { useState, useMemo } from 'react';
import { ChevronDown, Calendar, Search } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useTransactionStore } from '../stores/transactionStore';
import { useTransactions } from '../hooks/useTransactions';
import { formatIDR } from '../utils/formatCurrency';
import { getCategoryIcon, getCategoryLabel } from '../utils/categoryMeta';
import { isSameMonth, isSameYear, format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import TransactionActionModal from '../components/ui/TransactionActionModal';
import { deleteTransaction } from '../services/transactionService';
import type { Transaction } from '../types';

const HistoryPage: React.FC = () => {
  useTransactions();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { myTransactions, partnerTransactions } = useTransactionStore();
  
  const [filterMode, setFilterMode] = useState<'saya' | 'pasangan' | 'semua'>('saya');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    let pool: Transaction[] = [];
    if (filterMode === 'saya') pool = myTransactions;
    else if (filterMode === 'pasangan') pool = partnerTransactions;
    else pool = [...myTransactions, ...partnerTransactions];

    return pool
      .filter((tx) => {
        const date = tx.date.toDate();
        return isSameMonth(date, new Date(selectedYear, selectedMonth)) && isSameYear(date, new Date(selectedYear, selectedMonth));
      })
      .sort((a, b) => b.date.toMillis() - a.date.toMillis());
  }, [filterMode, selectedMonth, selectedYear, myTransactions, partnerTransactions]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach((tx) => {
      const dateKey = format(tx.date.toDate(), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    });
    return groups;
  }, [filteredTransactions]);

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat</h1>
      </header>
      
      <div className="flex bg-gray-100 p-1 rounded-xl">
        {[
          { id: 'saya', label: 'Saya' },
          { id: 'pasangan', label: 'Pasangan' },
          { id: 'semua', label: 'Gabungan' },
        ].map((m) => (
          <button
            key={m.id}
            disabled={m.id !== 'saya' && !currentUser?.linkedPartnerId}
            onClick={() => setFilterMode(m.id as any)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              filterMode === m.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 disabled:opacity-50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Bulan & Tahun</p>
              <span className="font-bold text-gray-900 truncate">
                {format(new Date(selectedYear, selectedMonth), 'MMMM yyyy', { locale: localeId })}
              </span>
            </div>
          </div>
          <ChevronDown size={18} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
          {/* Native Select Hidden but clickable */}
          <input 
            type="month" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            value={`${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split('-');
              setSelectedYear(parseInt(y));
              setSelectedMonth(parseInt(m) - 1);
            }}
          />
        </div>
      </div>

      <div className="space-y-8 pb-4">
        {Object.keys(groupedTransactions).length > 0 ? (
          Object.keys(groupedTransactions).map((dateKey) => (
            <div key={dateKey} className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 px-1 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-200 rounded-full"></span>
                {format(new Date(dateKey), 'EEEE, dd MMMM yyyy', { locale: localeId })}
              </h3>
              <div className="space-y-3">
                {groupedTransactions[dateKey].map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm active:bg-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => { setSelectedTransaction(tx); setIsModalOpen(true); }}
                  >
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white">
                      {getCategoryIcon(tx.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 truncate">{getCategoryLabel(tx.category)}</p>
                        {filterMode === 'semua' && (
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                            tx.ownerId === currentUser?.uid 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'bg-purple-50 text-purple-600'
                          }`}>
                            {tx.ownerId === currentUser?.uid ? 'SAYA' : 'PASANGAN'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 italic truncate">{tx.note || 'Tidak ada catatan'}</p>
                    </div>
                    <p className={`font-bold tabular-nums ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatIDR(tx.amount).replace('Rp ', '')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full mx-auto flex items-center justify-center">
              <LogOut size={32} className="text-gray-200" />
            </div>
            <div>
              <p className="text-gray-900 font-bold">Tidak ada riwayat</p>
              <p className="text-gray-400 text-xs font-medium">Coba ganti filter atau bulan lainnya.</p>
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
};

// Placeholder for missing icon or just use existing one
const LogOut = Search; 

export default HistoryPage;
