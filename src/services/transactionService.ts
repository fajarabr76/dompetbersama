import { 
  collection, 
  addDoc, 
  Timestamp, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  limit,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Transaction, TransactionType } from "../types";

export const addTransaction = async (
  ownerId: string,
  type: TransactionType,
  amount: number,
  category: string,
  creditorName: string | null = null,
  note: string | null = null,
  date: Date = new Date()
) => {
  try {
    const docRef = await addDoc(collection(db, "transactions"), {
      ownerId,
      type,
      amount,
      category,
      creditorName,
      note,
      date: Timestamp.fromDate(date),
      createdAt: Timestamp.now(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding transaction", error);
    return { success: false, error: "Gagal menyimpan transaksi." };
  }
};

export const subscribeTransactions = (
  userId: string,
  callback: (transactions: Transaction[]) => void,
  limitTo: number = 50
) => {
  const q = query(
    collection(db, "transactions"),
    where("ownerId", "==", userId),
    orderBy("date", "desc"),
    limit(limitTo)
  );

  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
    callback(transactions);
  });
};

export const updateTransaction = async (
  id: string,
  data: Pick<Transaction, 'amount' | 'type' | 'category' | 'note' | 'creditorName'> & { date?: Date }
) => {
  try {
    const updatePayload: any = {
      amount: data.amount,
      type: data.type,
      category: data.category,
      note: data.note,
      creditorName: data.creditorName,
    };
    
    if (data.date) {
      updatePayload.date = Timestamp.fromDate(data.date);
    }

    await updateDoc(doc(db, "transactions", id), updatePayload);
    return { success: true };
  } catch (error) {
    console.error("Error updating transaction", error);
    return { success: false, error: "Gagal memperbarui transaksi." };
  }
};

export const deleteTransaction = async (id: string) => {
  try {
    await deleteDoc(doc(db, "transactions", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction", error);
    return { success: false, error: "Gagal menghapus transaksi." };
  }
};
