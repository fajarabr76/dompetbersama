import React, { useState } from 'react';
import { Share2, Link as LinkIcon, Check, Loader2, LogOut, User as UserIcon, Unlink, Wallet, X } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { linkPartnerByCode, disconnectPartner, updateInitialBalance } from '../services/userService';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { formatIDR, parseIDR, formatInputIDR } from '../utils/formatCurrency';

const SettingsPage: React.FC = () => {
  const { currentUser, clearUser, firebaseUser, setUser } = useAuthStore();
  const navigate = useNavigate();
  
  const [targetCode, setTargetCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState('');

  // Initial Balance state
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState('');
  const [isSavingBalance, setIsSavingBalance] = useState(false);

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
    } else {
      setTargetCode('');
    }
    setIsLinking(false);
  };

  const handleStartEditBalance = () => {
    setTempBalance(formatIDR(currentUser?.initialBalance ?? 0));
    setIsEditingBalance(true);
  };

  const handleSaveBalance = async () => {
    if (!currentUser || !firebaseUser) return;
    
    setIsSavingBalance(true);
    const parsed = parseIDR(tempBalance);
    const result = await updateInitialBalance(currentUser.uid, parsed);
    
    if (result.success) {
      setUser({ ...currentUser, initialBalance: parsed }, firebaseUser);
      setIsEditingBalance(false);
    } else {
      setError(result.error || 'Gagal menyimpan saldo.');
    }
    setIsSavingBalance(false);
  };

  const handleDisconnect = async () => {
    if (!currentUser?.linkedPartnerId) return;
    
    if (!window.confirm(`Yakin ingin memutuskan koneksi dengan ${currentUser.linkedPartnerName}?`)) return;

    setIsDisconnecting(true);
    setError('');

    const result = await disconnectPartner(currentUser.uid, currentUser.linkedPartnerId);

    if (!result.success) {
      setError(result.error || 'Gagal memutuskan koneksi.');
    }
    setIsDisconnecting(false);
  };

  const handleLogout = async () => {
    if (!window.confirm('Yakin ingin keluar?')) return;
    await signOut(auth);
    clearUser();
    navigate('/login', { replace: true });
  };

  if (!currentUser) return null;

  return (
    <div className="p-4 space-y-8 pb-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profil & Pengaturan</h1>
      </header>

      {/* Profile Section */}
      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-4 text-center">
        <div className="w-24 h-24 bg-indigo-50 rounded-full overflow-hidden flex items-center justify-center border-4 border-white shadow-lg">
          {currentUser.photoURL ? (
            <img src={currentUser.photoURL} alt={currentUser.name} className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={40} className="text-indigo-300" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{currentUser.name}</h2>
          <p className="text-sm text-gray-500 font-medium">{currentUser.email}</p>
        </div>
      </section>

      {/* Partner Code Section */}
      <section className="bg-indigo-600 text-white p-6 rounded-3xl space-y-4 shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="flex items-center gap-2 relative z-10">
          <Share2 size={20} className="text-indigo-200" />
          <span className="text-sm font-bold text-indigo-100">KODE PARTNER SAYA</span>
        </div>
        <div className="flex items-center justify-between relative z-10">
          <span className="text-4xl font-black tracking-widest font-mono">
            {currentUser.partnerCode || '......'}
          </span>
          <button
            onClick={handleCopy}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl transition-all active:scale-95"
          >
            {isCopied ? <Check size={20} /> : <Share2 size={20} />}
          </button>
        </div>
      </section>

      {/* Financial Section (Saldo Awal) */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Keuangan</h3>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-400">SALDO AWAL SAYA</p>
                {isEditingBalance ? (
                  <input
                    type="text"
                    value={tempBalance}
                    onChange={(e) => setTempBalance(formatInputIDR(e.target.value))}
                    className="text-lg font-bold text-gray-900 focus:outline-none border-b-2 border-indigo-600 w-full bg-transparent"
                    autoFocus
                  />
                ) : (
                  <p className="text-lg font-bold text-gray-900">{formatIDR(currentUser.initialBalance ?? 0)}</p>
                )}
              </div>
            </div>
            {!isEditingBalance && (
              <button 
                onClick={handleStartEditBalance}
                className="text-sm font-bold text-indigo-600 px-4 py-2 bg-indigo-50 rounded-xl active:scale-95 transition-all outline-none"
              >
                Ubah
              </button>
            )}
          </div>

          {isEditingBalance && (
            <div className="flex gap-2">
              <button
                disabled={isSavingBalance}
                onClick={handleSaveBalance}
                className="flex-1 h-12 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all outline-none"
              >
                {isSavingBalance ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Simpan
              </button>
              <button
                onClick={() => setIsEditingBalance(false)}
                className="w-12 h-12 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center active:scale-95 transition-all outline-none"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Link / Unlink Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Koneksi Pasangan</h3>
        
        {currentUser.linkStatus === 'linked' ? (
          <div className="bg-green-50 p-6 rounded-3xl border border-green-100 text-center space-y-4">
            <div className="w-16 h-16 bg-white text-green-500 rounded-full mx-auto flex items-center justify-center shadow-sm">
              <Check size={32} strokeWidth={3} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Terhubung dengan</p>
              <p className="text-xl font-bold text-gray-900">{currentUser.linkedPartnerName}</p>
            </div>
            <button
              disabled={isDisconnecting}
              onClick={handleDisconnect}
              className="w-full h-12 bg-white text-red-600 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm border border-red-100 active:scale-95 transition-all outline-none"
            >
              {isDisconnecting ? <Loader2 size={18} className="animate-spin" /> : <Unlink size={18} />}
              <span>Putuskan Koneksi</span>
            </button>
            {error && <p className="text-xs text-red-500 font-bold px-1">{error}</p>}
          </div>
        ) : (
          <div className="space-y-4">
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
                placeholder="MASUKKAN KODE"
              />
            </div>
            {error && <p className="text-xs text-red-500 font-bold px-1">{error}</p>}

            <button
              disabled={isLinking || targetCode.length < 6}
              onClick={handleLink}
              className="w-full h-14 bg-indigo-600 disabled:bg-gray-200 text-white rounded-2xl flex items-center justify-center gap-3 font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all outline-none"
            >
              {isLinking ? <Loader2 size={20} className="animate-spin" /> : <LinkIcon size={20} />}
              <span>Hubungkan Akun</span>
            </button>
          </div>
        )}
      </section>

      {/* Logout Section */}
      <section className="pt-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center gap-3 font-bold active:scale-95 transition-all outline-none"
        >
          <LogOut size={20} />
          <span>Keluar Akun</span>
        </button>
      </section>
    </div>
  );
};

export default SettingsPage;
