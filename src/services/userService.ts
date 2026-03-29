import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  writeBatch,
  updateDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";

export const linkPartnerByCode = async (
  code: string,
  currentUserId: string,
  currentUserName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // 1. Find user with matching partnerCode
    const q = query(collection(db, "users"), where("partnerCode", "==", code.toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return { success: false, error: "Kode tidak ditemukan" };

    const partnerDoc = snapshot.docs[0];
    const partnerId = partnerDoc.id;
    const partnerData = partnerDoc.data();

    if (partnerId === currentUserId)
      return { success: false, error: "Tidak bisa menghubungkan ke akun sendiri" };
    
    if (partnerData.linkStatus === "linked")
      return { success: false, error: "Pasangan ini sudah terhubung dengan akun lain" };

    // 2. Update both documents atomically
    const batch = writeBatch(db);
    batch.update(doc(db, "users", currentUserId), {
      linkedPartnerId: partnerId,
      linkedPartnerName: partnerData.name,
      linkStatus: "linked",
    });
    batch.update(doc(db, "users", partnerId), {
      linkedPartnerId: currentUserId,
      linkedPartnerName: currentUserName,
      linkStatus: "linked",
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Linking failed", error);
    return { success: false, error: "Gagal menghubungkan. Silakan coba lagi." };
  }
};

export const generatePartnerCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const disconnectPartner = async (
  currentUserId: string,
  partnerId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, "users", currentUserId), {
      linkedPartnerId: null,
      linkedPartnerName: null,
      linkStatus: "unlinked",
    });
    batch.update(doc(db, "users", partnerId), {
      linkedPartnerId: null,
      linkedPartnerName: null,
      linkStatus: "unlinked",
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Disconnect failed", error);
    return { success: false, error: "Gagal memutuskan koneksi. Silakan coba lagi." };
  }
};

export const updateInitialBalance = async (
  uid: string,
  balance: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      initialBalance: balance,
    });
    return { success: true };
  } catch (error) {
    console.error("Update initial balance failed", error);
    return { success: false, error: "Gagal menyimpan saldo awal. Silakan coba lagi." };
  }
};
