import { LogIn } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { generatePartnerCode } from '../services/userService';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const partnerCode = generatePartnerCode();
        await setDoc(userRef, {
          uid: fbUser.uid,
          name: fbUser.displayName || 'User',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || '',
          partnerCode,
          linkedPartnerId: null,
          linkedPartnerName: null,
          linkStatus: 'unlinked',
          createdAt: Timestamp.now(),
        });
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="mobile-wrapper flex items-center justify-center p-8 text-center bg-white shadow-none">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-indigo-200 shadow-2xl">
            <LogIn size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Dompet Bersama
          </h1>
          <p className="text-gray-500 font-medium">
            Atur dan pantau finansial bersama pasangan dalam satu genggaman.
          </p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center gap-3 font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          <span>Masuk dengan Google</span>
        </button>

        <p className="text-xs text-gray-400 mt-8">
          Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
