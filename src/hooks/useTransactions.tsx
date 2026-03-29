import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useTransactionStore } from '../stores/transactionStore';
import { subscribeTransactions } from '../services/transactionService';

export const useTransactions = () => {
  const { currentUser } = useAuthStore();
  const { setMyTransactions, setPartnerTransactions } = useTransactionStore();

  useEffect(() => {
    if (!currentUser) return;

    // Sync my transactions
    const unsubscribeMe = subscribeTransactions(currentUser.uid, (txs) => {
      setMyTransactions(txs);
    });

    // Sync partner transactions if linked
    let unsubscribePartner: (() => void) | undefined;
    if (currentUser.linkedPartnerId) {
      unsubscribePartner = subscribeTransactions(currentUser.linkedPartnerId, (txs) => {
        setPartnerTransactions(txs);
      });
    }

    return () => {
      unsubscribeMe();
      if (unsubscribePartner) unsubscribePartner();
    };
  }, [currentUser, setMyTransactions, setPartnerTransactions]);
};
