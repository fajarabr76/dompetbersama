import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { useAuthStore } from '../../stores/authStore';
import { doc, onSnapshot } from 'firebase/firestore';
import type { User } from '../../types';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { setUser, setLoading, clearUser } = useAuthStore();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setLoading(true);
        const userRef = doc(db, 'users', fbUser.uid);
        
        // Setup real-time listener for user document
        const unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as User, fbUser);
          } else {
            // Document doesn't exist yet, will be created in Login logic or here
            setLoading(false);
          }
        });

        return () => unsubscribeDoc();
      } else {
        clearUser();
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [setUser, setLoading, clearUser]);

  return <>{children}</>;
};

export default AuthProvider;
