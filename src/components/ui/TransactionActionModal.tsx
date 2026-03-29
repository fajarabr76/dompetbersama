import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import type { Transaction } from '../../types';
import { formatIDR } from '../../utils/formatCurrency';

interface TransactionActionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDeleteConfirm: () => void;
}

type ModalState = 'menu' | 'confirm-delete';

const TransactionActionModal: React.FC<TransactionActionModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onEdit,
  onDeleteConfirm,
}) => {
  const [viewState, setViewState] = useState<ModalState>('menu');

  // Reset state every time the modal is opened
  useEffect(() => {
    if (isOpen) {
      setViewState('menu');
    }
  }, [isOpen]);

  if (!isOpen || !transaction) return null;

  return createPortal(
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/40 z-[999] transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white rounded-t-3xl z-[1000] shadow-2xl safe-area-bottom animate-in slide-in-from-bottom-full duration-300">
        
        {/* Handle for drag indicator (visual only) */}
        <div className="w-full flex justify-center py-3" onClick={onClose}>
          <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
        </div>

        <div className="px-6 pb-8 pt-2 space-y-4">
          {viewState === 'menu' ? (
            <div className="flex flex-col gap-3">
              <button 
                onClick={onEdit}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 rounded-2xl transition-colors active:scale-95 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-gray-100 group-hover:border-indigo-100">
                    <Edit2 size={20} />
                  </div>
                  <span className="font-bold text-gray-900">Ubah Transaksi</span>
                </div>
              </button>

              <button 
                onClick={() => setViewState('confirm-delete')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-red-50 rounded-2xl transition-colors active:scale-95 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm border border-gray-100 group-hover:border-red-100">
                    <Trash2 size={20} />
                  </div>
                  <span className="font-bold text-red-600">Hapus Transaksi</span>
                </div>
              </button>

              <button 
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 p-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors mt-2"
              >
                <X size={20} />
                <span>Batal</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <AlertTriangle size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900">Hapus Transaksi?</h3>
                <p className="text-sm text-gray-500 px-4">
                  Anda yakin ingin menghapus transaksi sebesar <span className="font-bold text-gray-900">{formatIDR(transaction.amount)}</span>? Data ini tidak dapat dikembalikan.
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => setViewState('menu')}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  Kembali
                </button>
                <button 
                  onClick={onDeleteConfirm}
                  className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl active:scale-95 transition-transform shadow-lg shadow-red-200"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default TransactionActionModal;
