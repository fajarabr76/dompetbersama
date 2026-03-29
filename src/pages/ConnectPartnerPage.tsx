import React, { useState } from 'react';
import { Share2, Link as LinkIcon, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { linkPartnerByCode } from '../services/userService';

const ConnectPartnerPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const [targetCode, setTargetCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState('');

  const handleCopy = () => {
    if (!currentUser?.partnerCode) return;
    navigator.clipboard.writeText(currentUser.partnerCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLink = async () => {
    if (!currentUser || targetCode.length < 6) return;
    
    setIsLinking(true);
    setError('');
    
    const result = await linkPartnerByCode(targetCode, currentUser.uid, currentUser.name);
    
    if (!result.success) {
      setError(result.error || 'Gagal menghubungkan.');
      setIsLinking(false);
    }
    // Success will be reflected via real-time listener in AuthProvider
  };

  if (currentUser?.linkStatus === 'linked') {
    return (
      <div className="p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
          <Check size={40} strokeWidth={3} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Sudah Terhubung!</h2>
          <p className="text-gray-500 font-medium">
            Akun Anda sekarang terhubung dengan <span className="text-indigo-600 font-bold">{currentUser.linkedPartnerName}</span>.
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm text-gray-400">
          Anda sekarang dapat melihat ringkasan keuangan satu sama lain di Dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Hubungkan Pasangan</h1>
      </header>

      <section className="space-y-4">
        <div className="bg-indigo-600 text-white p-6 rounded-3xl space-y-4 shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <div className="flex items-center gap-2 relative z-10">
            <Share2 size={20} className="text-indigo-200" />
            <span className="text-sm font-bold text-indigo-100">KODE SAYA</span>
          </div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-4xl font-black tracking-widest font-mono">
              {currentUser?.partnerCode || '......'}
            </span>
            <button
              onClick={handleCopy}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl transition-all active:scale-95"
            >
              {isCopied ? <Check size={20} /> : <Share2 size={20} />}
            </button>
          </div>
          <p className="text-xs text-indigo-100 font-medium relative z-10">
            Bagikan kode ini ke pasanganmu agar akun kalian saling terhubung.
          </p>
        </div>
      </section>

      <div className="flex items-center gap-4 py-2">
        <div className="h-[1px] flex-1 bg-gray-100"></div>
        <span className="text-xs font-bold text-gray-400">ATAU</span>
        <div className="h-[1px] flex-1 bg-gray-100"></div>
      </div>

      <section className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-500">Masukkan Kode Pasangan</label>
          <div className={`flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border transition-all ${
            error ? 'border-red-200 ring-4 ring-red-50' : 'border-gray-100 focus-within:border-indigo-200'
          }`}>
            <LinkIcon size={20} className={error ? 'text-red-400' : 'text-gray-400'} />
            <input
              type="text"
              maxLength={6}
              value={targetCode}
              onChange={(e) => setTargetCode(e.target.value.toUpperCase())}
              className="w-full bg-transparent text-xl font-bold text-gray-900 focus:outline-none placeholder:text-gray-300 font-mono"
              placeholder="CONTOH: ABCDEF"
            />
          </div>
          {error && <p className="text-xs text-red-500 font-bold px-1">{error}</p>}
        </div>

        <button
          disabled={isLinking || targetCode.length < 6}
          onClick={handleLink}
          className="w-full h-14 bg-indigo-600 disabled:bg-gray-200 text-white rounded-2xl flex items-center justify-center gap-3 font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all"
        >
          {isLinking ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <LinkIcon size={20} />
              <span>Hubungkan Akun</span>
            </>
          )}
        </button>
      </section>

      <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
          Menghubungkan akun memungkinkan pasangan melihat ringkasan keuangan dan riwayat transaksi masing-masing. Fitur ini bersifat mutual.
        </p>
      </div>
    </div>
  );
};

export default ConnectPartnerPage;
