import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { formatInputIDR, parseIDR } from '../../utils/formatCurrency';
import { ArrowRight } from 'lucide-react';

interface InitialBalanceModalProps {
  isOpen: boolean;
  onSave: (balance: number) => void;
}

const InitialBalanceModal: React.FC<InitialBalanceModalProps> = ({ isOpen, onSave }) => {
  const [amountDisplay, setAmountDisplay] = useState('');

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountDisplay(formatInputIDR(e.target.value));
  };

  const handleSave = () => {
    // parseIDR returns 0 if input is empty or invalid numeric
    const amount = parseIDR(amountDisplay);
    onSave(amount);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-gray-100">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-5xl shadow-inner border border-indigo-100/50">
            💰
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Halo! 👋</h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed px-2">
              Masukkan total saldo yang sudah kamu miliki sebelum menggunakan Dompet Bersama. Ini tidak akan dianggap sebagai pendapatan.
            </p>
          </div>

          <div className="w-full space-y-2">
            <div className="flex items-center gap-3 p-6 bg-gray-50 rounded-3xl border border-gray-100 focus-within:border-indigo-200 focus-within:ring-4 focus-within:ring-indigo-50 transition-all duration-300">
              <span className="text-2xl font-bold text-gray-400">Rp</span>
              <input
                type="tel"
                inputMode="numeric"
                autoFocus
                value={amountDisplay}
                onChange={handleAmountChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                }}
                className="w-full bg-transparent text-4xl font-black text-gray-900 focus:outline-none placeholder:text-gray-200"
                placeholder="0"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl flex items-center justify-center gap-3 font-black text-lg shadow-xl shadow-indigo-200 active:scale-95 transition-all duration-300 group"
          >
            <span>Mulai Sekarang</span>
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InitialBalanceModal;
