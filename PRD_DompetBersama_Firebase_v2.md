# Product Requirements Document
# Aplikasi Pencatatan Keuangan Pasangan — Frontend MVP

**Versi:** 2.0 — Firebase Edition  
**Tanggal:** 28 Maret 2026  
**Status:** Ready for Development  
**Stack:** React + TypeScript + Firebase + Tailwind CSS  

---

## Daftar Isi

1. [Latar Belakang & Problem Statement](#1-latar-belakang--problem-statement)
2. [Tujuan Produk & Success Metrics](#2-tujuan-produk--success-metrics)
3. [Tech Stack & Keputusan Arsitektur](#3-tech-stack--keputusan-arsitektur)
4. [Spesifikasi Arsitektur Frontend](#4-spesifikasi-arsitektur-frontend)
5. [Struktur Data Firestore](#5-struktur-data-firestore)
6. [Mekanisme Koneksi Pasangan](#6-mekanisme-koneksi-pasangan)
7. [Ruang Lingkup MVP — Halaman & Komponen](#7-ruang-lingkup-mvp--halaman--komponen)
8. [Spesifikasi Zustand Stores](#8-spesifikasi-zustand-stores)
9. [Hierarki Komponen](#9-hierarki-komponen)
10. [Komponen Reusable](#10-komponen-reusable)
11. [Utility Functions](#11-utility-functions)
12. [Firebase Security Rules](#12-firebase-security-rules)
13. [Panduan UX](#13-panduan-ux)
14. [Non-Functional Requirements](#14-non-functional-requirements)
15. [Out-of-Scope](#15-out-of-scope)
16. [Estimasi Milestone](#16-estimasi-milestone)
17. [Checklist Developer](#17-checklist-developer)
18. [Appendix — Keputusan yang Ditangguhkan](#18-appendix--keputusan-yang-ditangguhkan)

---

## 1. Latar Belakang & Problem Statement

Pasangan yang mengelola keuangan secara terpisah sering kehilangan visibilitas atas kondisi finansial satu sama lain, sehingga sulit membuat keputusan keuangan bersama secara real-time. Tidak ada alat pencatatan yang sederhana namun memungkinkan dua individu memiliki ruang data pribadi sekaligus bisa saling melihat ringkasan secara mutual.

Produk ini menjawab kebutuhan tersebut dengan menyediakan antarmuka mobile yang memungkinkan masing-masing pasangan mencatat keuangan pribadinya — termasuk utang kepada pihak ketiga seperti kartu kredit dan cicilan bank — serta memberikan akses saling-lihat antar akun yang terhubung.

**Target pengguna:** Pasangan yang keduanya berada dalam ekosistem Google (memiliki akun Google aktif).

---

## 2. Tujuan Produk & Success Metrics

| Tujuan | Indikator Keberhasilan (MVP) |
|--------|------------------------------|
| Pengguna dapat mencatat transaksi dengan cepat | Rata-rata waktu input ≤ 30 detik per transaksi |
| Toggle Pribadi/Pasangan terasa instan | Transisi state < 100ms, 0 loading spinner |
| Dua akun terhubung via kode undangan | Alur koneksi selesai dalam ≤ 3 langkah |
| Aplikasi dapat digunakan tanpa install | PWA dapat di-add to homescreen di Android & iOS |
| Data tersimpan dan aman | Hanya pemilik dan pasangan yang terhubung yang bisa membaca data |

---

## 3. Tech Stack & Keputusan Arsitektur

### 3.1 Stack Lengkap

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Framework UI** | React 19 + TypeScript | Ekosistem terluas, type safety, kompatibel penuh dengan Firebase JS SDK v10 |
| **Build Tool** | Vite | Cold start cepat, HMR instan, plugin PWA tersedia |
| **Styling** | Tailwind CSS v4 | Utility-first, ideal untuk komponen mobile kecil |
| **State (Client)** | Zustand | Bundle 1.2KB, API minimal, tidak butuh Provider wrapper |
| **Routing** | React Router v7 | Standar industri, nested routes untuk layout navigasi |
| **Backend** | Firebase (Google) | Ekosistem Google, Auth + Firestore + Hosting dalam satu platform |
| **Database** | Firestore (NoSQL) | Real-time listener bawaan, free tier generous, query simpel |
| **Auth** | Firebase Authentication | Google Sign-In satu klik, mature, 50K MAU gratis |
| **Hosting** | Firebase Hosting | Gratis, CDN Google global, deploy via CLI |
| **PWA** | vite-plugin-pwa | Service worker otomatis, manifest generator |

### 3.2 Firebase Free Tier (Spark Plan) — Estimasi Konsumsi

| Resource | Limit Gratis | Estimasi Konsumsi MVP |
|----------|-------------|----------------------|
| Firestore reads | 50.000/hari | ~500–1.000/hari (2 user aktif) |
| Firestore writes | 20.000/hari | ~50–100/hari |
| Firestore storage | 1 GB | < 10 MB fase MVP |
| Auth MAU | 50.000/bulan | 2 user |
| Hosting bandwidth | 360 MB/hari | < 50 MB/hari |
| **Status** | **Aman di free tier** | |

> **Catatan:** Implementasikan pagination pada riwayat transaksi untuk menghindari baca dokumen berlebih seiring waktu.

---

## 4. Spesifikasi Arsitektur Frontend

### 4.1 Constraint Layar

- Wrapper utama: `max-width: 480px`, `margin: 0 auto`
- Background di luar wrapper (desktop): `#F3F4F6`
- Seluruh layout menggunakan `min-height: 100dvh` (bukan `100vh`) untuk kompatibilitas iOS Safari
- Bottom navigation: `padding-bottom: env(safe-area-inset-bottom)` untuk iPhone notch

### 4.2 Struktur Proyek

```
src/
├── components/
│   ├── ui/            # Atom: Button, Card, Badge, Toast
│   └── features/      # Molekul: TransactionRow, SummaryCard, CategoryGrid
├── pages/             # Dashboard, AddTransaction, History, Connect, Login
├── stores/            # authStore, transactionStore, dashboardStore, partnerStore
├── services/          # authService, transactionService, userService
├── hooks/             # useAuth, useTransactions, usePartner
├── types/             # TypeScript interfaces global
├── utils/             # formatCurrency, computeAggregation, dateHelper, categoryMeta
├── lib/               # firebase.ts
└── data/              # categories.ts
```

### 4.3 Konfigurasi Firebase

```typescript
// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
```

> Semua key Firebase wajib disimpan di `.env.local` dan tidak boleh di-commit ke repository.

### 4.4 PWA Manifest

```json
{
  "name": "Dompet Bersama",
  "short_name": "DomBer",
  "description": "Pencatatan keuangan untuk pasangan",
  "theme_color": "#4F46E5",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/"
}
```

---

## 5. Struktur Data Firestore

### 5.1 Koleksi `users`

```
users/
  {userId}/
    name: string
    email: string
    photoURL: string
    partnerCode: string            # Kode 6 digit unik, auto-generate saat register
    linkedPartnerId: string | null # UID pasangan, null jika belum terhubung
    linkedPartnerName: string | null
    linkStatus: "unlinked" | "pending" | "linked"
    createdAt: Timestamp
```

### 5.2 Koleksi `transactions`

```
transactions/
  {transactionId}/
    ownerId: string                # Firebase Auth UID pemilik
    type: "income" | "expense" | "debt" | "debt_payment"
    amount: number                 # Numerik murni, contoh: 1500000
    category: string               # Slug, contoh: "food", "credit_card"
    creditorName: string | null    # Wajib jika type = "debt" | "debt_payment"
                                   # Contoh: "BCA Credit Card", "KPR Mandiri"
    date: Timestamp
    note: string | null            # Opsional, max 200 karakter
    createdAt: Timestamp
```

> **Keputusan domain:** `creditorName` hanya untuk utang ke pihak ketiga (bank, kartu kredit, cicilan). Tidak ada utang antar pasangan di fase ini.

### 5.3 Pola Query Utama

```typescript
// Transaksi bulan ini milik satu user
query(
  collection(db, "transactions"),
  where("ownerId", "==", userId),
  where("date", ">=", startOfMonth),
  where("date", "<=", endOfMonth),
  orderBy("date", "desc")
)

// 5 transaksi terbaru
query(
  collection(db, "transactions"),
  where("ownerId", "==", userId),
  orderBy("date", "desc"),
  limit(5)
)
```

> Setiap dokumen yang dikembalikan = 1 Firestore read. Selalu gunakan `limit()` di query dashboard.

### 5.4 Agregasi Keuangan (Computed — Client Side)

Karena Firestore tidak mendukung `SUM()` atau `GROUP BY`, kalkulasi dilakukan di client:

```typescript
interface FinancialSummary {
  ownerId: string;
  currentBalance: number;      // Sigma income - Sigma expense (semua waktu)
  monthlyIncome: number;       // Sigma income bulan aktif
  monthlyExpense: number;      // Sigma expense bulan aktif
  totalActiveDebt: number;     // Sigma debt - Sigma debt_payment (semua waktu)
}

// src/utils/computeAggregation.ts
export const computeSummary = (
  transactions: Transaction[],
  ownerId: string,
  month: number,
  year: number
): FinancialSummary
```

---

## 6. Mekanisme Koneksi Pasangan

### 6.1 Alur Koneksi (3 Langkah)

```
[User A]                                   [User B]
   |                                           |
   |-- 1. Buka /connect                        |
   |      Tampil partnerCode milik A           |
   |                                           |
   |               2. User B input kode A -----|
   |                  Firebase batch write     |
   |                                           |
   |-- 3. Kedua dokumen user diupdate ---------|
   |      A.linkedPartnerId = B.uid            |
   |      B.linkedPartnerId = A.uid            |
   |      linkStatus = "linked"                |
   |-------------- Terhubung -----------------|
```

### 6.2 Implementasi Service

```typescript
// src/services/userService.ts
export const linkPartnerByCode = async (
  code: string,
  currentUserId: string
): Promise<{ success: boolean; error?: string }> => {

  // 1. Cari user dengan partnerCode yang cocok
  const q = query(collection(db, "users"), where("partnerCode", "==", code));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return { success: false, error: "Kode tidak ditemukan" };

  const partnerDoc = snapshot.docs[0];
  const partnerId = partnerDoc.id;

  if (partnerId === currentUserId)
    return { success: false, error: "Tidak bisa menghubungkan ke akun sendiri" };

  // 2. Update kedua dokumen secara atomik
  const batch = writeBatch(db);
  batch.update(doc(db, "users", currentUserId), {
    linkedPartnerId: partnerId,
    linkedPartnerName: partnerDoc.data().name,
    linkStatus: "linked",
  });
  batch.update(doc(db, "users", partnerId), {
    linkedPartnerId: currentUserId,
    linkStatus: "linked",
  });

  await batch.commit();
  return { success: true };
};
```

---

## 7. Ruang Lingkup MVP — Halaman & Komponen

### 7.1 Navigasi Utama — `<BottomNav />`

- Tiga tab: **Dasbor** (ikon rumah) | **Tambah** (ikon + besar, center) | **Riwayat** (ikon daftar)
- Tab aktif: `#4F46E5` | Non-aktif: `#9CA3AF`
- Tinggi: `64px`
- Touch target minimum: `48x48px`
- `padding-bottom: env(safe-area-inset-bottom)`

---

### 7.2 Halaman Login — `/login`

- Satu tombol: "Masuk dengan Google" via `signInWithPopup(auth, googleProvider)`
- Setelah login: cek apakah `users/{uid}` sudah ada
  - Belum ada → buat dokumen baru + generate `partnerCode` 6 digit
  - Sudah ada → load ke `authStore`
- Redirect ke `/dashboard` setelah sukses

---

### 7.3 Halaman Dasbor — `/dashboard`

#### a. Segmented Button Kontrol Tampilan

- Dua opsi: `"Pribadi"` dan `"Pasangan"`
- Default: `"Pribadi"`
- Saat `"Pasangan"` dipilih: `dashboardStore.setActiveOwnerId(linkedPartnerId)`
- Jika pasangan belum terhubung: tombol "Pasangan" disabled + tooltip `"Hubungkan pasangan dulu di Profil"`
- Transisi harus 0ms loading — data pasangan sudah di-fetch via real-time listener

#### b. Kartu Ringkasan

| Kartu | Data | Warna Aksen |
|-------|------|-------------|
| Total Saldo | `currentBalance` | Indigo `#4F46E5` |
| Pendapatan Bulan Ini | `monthlyIncome` | Hijau `#16A34A` |
| Pengeluaran Bulan Ini | `monthlyExpense` | Merah `#DC2626` |
| Total Hutang Aktif | `totalActiveDebt` | Oranye `#EA580C` |

- Format: `Rp 1.250.000`
- Skeleton `animate-pulse` saat loading pertama

#### c. Daftar Transaksi Singkat

- Maksimal 5 transaksi terbaru (query `limit(5)`)
- Filter berdasarkan `ownerId` aktif
- Tombol "Lihat Semua" → `/history`

**Acceptance Criteria:**
- Toggle Pribadi/Pasangan mengubah semua 4 kartu dan daftar transaksi tanpa refresh
- Tab "Pasangan" disabled jika `linkedPartnerId === null`
- Format `Rp` tampil benar untuk angka di atas 1 juta
- Skeleton tampil saat fetch pertama

---

### 7.4 Halaman Input Transaksi — `/add`

#### a. Tipe Transaksi
Tab horizontal 4 opsi: `Pendapatan` | `Pengeluaran` | `Catat Hutang` | `Bayar Hutang`

#### b. Input Nominal
- `<input type="tel" inputMode="numeric" />`
- Format real-time: `1000000` → `1.000.000`, prefix `Rp` statis
- Validasi: tidak boleh 0 atau kosong

#### c. Grid Kategori (4 kolom, emoji + label)

**Pengeluaran:**

| Ikon | Label | Slug |
|------|-------|------|
| 🍜 | Makan & Minum | `food` |
| 🚗 | Transportasi | `transport` |
| 🛒 | Belanja | `shopping` |
| 💊 | Kesehatan | `health` |
| 🎮 | Hiburan | `entertainment` |
| 🏠 | Rumah Tangga | `household` |
| 📦 | Lainnya | `other_expense` |

**Pendapatan:**

| Ikon | Label | Slug |
|------|-------|------|
| 💼 | Gaji | `salary` |
| 📈 | Investasi | `investment` |
| 🎁 | Bonus | `bonus` |
| 💰 | Usaha | `business` |
| 📦 | Lainnya | `other_income` |

**Hutang / Bayar Hutang:**

| Ikon | Label | Slug |
|------|-------|------|
| 💳 | Kartu Kredit | `credit_card` |
| 🏠 | KPR | `mortgage` |
| 🚗 | Kredit Kendaraan | `vehicle_loan` |
| 🏦 | Pinjaman Bank | `bank_loan` |
| 📦 | Lainnya | `other_debt` |

#### d. Field Nama Kreditur (Conditional)
- Hanya tampil jika tipe = `"debt"` atau `"debt_payment"`
- Input teks, placeholder: `"BCA Credit Card"`, `"KPR Mandiri"`
- Wajib diisi

#### e. Input Tanggal
- Native `<input type="date" />`, default: hari ini

#### f. Input Catatan
- `<textarea>` opsional, max 200 karakter

#### g. Tombol Simpan
- Lebar penuh, tinggi `52px`, sticky bottom
- Disabled jika nominal = 0 atau kategori belum dipilih
- Setelah sukses: redirect ke `/dashboard` + toast `"Transaksi disimpan"`

**Acceptance Criteria:**
- Keyboard numerik muncul saat fokus nominal
- Format Rp real-time
- Field `creditorName` hanya muncul saat tipe Hutang/Bayar Hutang
- Tombol Simpan disabled jika validasi gagal
- Data tersimpan ke Firestore `transactions`

---

### 7.5 Halaman Riwayat — `/history`

#### a. Filter Waktu
- Dua `<select>`: Bulan + Tahun, default bulan/tahun saat ini
- Filter reaktif tanpa tombol Apply

#### b. Filter Pemilik
- Segmented button: `"Saya"` | `"Pasangan"` | `"Gabungan"`
- "Pasangan" dan "Gabungan" disabled jika belum terhubung
- Mode Gabungan: dua query paralel via `Promise.all`

#### c. Daftar Transaksi
- Dikelompokkan per tanggal
- Format header: `"Jumat, 28 Maret 2026"`

#### d. Identifikasi Visual Mode Gabungan
- Chip nama pemilik di setiap baris
- User sendiri: chip biru `#DBEAFE` teks `#1D4ED8`
- Pasangan: chip ungu `#EDE9FE` teks `#6D28D9`

#### e. Empty State
- SVG inline + teks `"Tidak ada transaksi di bulan ini"`

**Acceptance Criteria:**
- Filter bulan/tahun reaktif
- Mode Gabungan tampilkan chip berbeda per user
- Kelompokkan per tanggal
- Empty state jika hasil = 0

---

### 7.6 Halaman Koneksi Pasangan — `/connect`

**Step 1 — Kode Saya:**
- Card kode 6 digit besar + tombol "Salin Kode" (Clipboard API)
- Teks: "Bagikan kode ini ke pasanganmu"

**Step 2 — Input Kode Pasangan:**
- Input 6 karakter + tombol "Hubungkan"
- Loading state saat batch write berjalan
- Sukses: halaman konfirmasi dengan nama pasangan
- Error: teks merah inline di bawah input

---

## 8. Spesifikasi Zustand Stores

### 8.1 `authStore`

```typescript
interface AuthStore {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User, fbUser: FirebaseUser) => void;
  clearUser: () => void;
}
```

### 8.2 `transactionStore`

```typescript
interface TransactionStore {
  myTransactions: Transaction[];
  partnerTransactions: Transaction[];
  isLoading: boolean;

  setMyTransactions: (txs: Transaction[]) => void;
  setPartnerTransactions: (txs: Transaction[]) => void;
  addTransaction: (tx: Transaction) => void;
}
```

> Data diisi oleh Firestore real-time listener di custom hook `useTransactions`, bukan fetch manual.

### 8.3 `dashboardStore`

```typescript
interface DashboardStore {
  activeOwnerId: string;
  activeMonth: number;
  activeYear: number;

  setActiveOwnerId: (id: string) => void;
  setActiveMonth: (month: number, year: number) => void;
}
```

### 8.4 `partnerStore`

```typescript
interface PartnerStore {
  partner: User | null;
  linkStatus: "unlinked" | "pending" | "linked";

  setPartner: (partner: User) => void;
  clearPartner: () => void;
}
```

---

## 9. Hierarki Komponen

```
<App>
├── <AuthProvider>                    # Firebase onAuthStateChanged listener
│   ├── /login → <LoginPage>
│   │   └── <GoogleSignInButton />
│   │
│   └── <AuthGuard>
│       └── <AppLayout>               # Wrapper 480px + BottomNav
│           ├── <BottomNav />
│           └── <Outlet />
│               ├── /dashboard → <DashboardPage>
│               │   ├── <SegmentedControl />
│               │   ├── <SummaryCardGrid>
│               │   │   └── <SummaryCard /> x4
│               │   └── <RecentTransactionList>
│               │       ├── <TransactionRow /> x5
│               │       └── <EmptyState />
│               │
│               ├── /add → <AddTransactionPage>
│               │   ├── <TypeTabSelector />
│               │   ├── <AmountInput />
│               │   ├── <CategoryGrid />
│               │   ├── <CreditorInput />      # Conditional
│               │   ├── <DateInput />
│               │   ├── <NoteInput />
│               │   └── <SaveButton />         # Sticky bottom
│               │
│               ├── /history → <HistoryPage>
│               │   ├── <MonthYearFilter />
│               │   ├── <OwnerFilter />
│               │   └── <GroupedTransactionList>
│               │       ├── <DateSeparator />
│               │       ├── <TransactionRow showOwnerChip? />
│               │       └── <EmptyState />
│               │
│               └── /connect → <ConnectPartnerPage>
│                   ├── <MyCodeCard />
│                   └── <LinkCodeForm />
```

---

## 10. Komponen Reusable

### `<TransactionRow />`

```typescript
interface TransactionRowProps {
  transaction: Transaction;
  showOwnerChip?: boolean;
  ownerName?: string;
  ownerColor?: "blue" | "purple";
}
```

- Layout: flex row, `gap-3`, `py-3`, border-bottom `1px solid #F3F4F6`
- Kiri: emoji kategori dalam circle 40x40px
- Tengah: nama kategori (semibold) + catatan (truncated) + tanggal kecil
- Kanan: nominal berwarna + OwnerChip jika `showOwnerChip=true`

### `<SummaryCard />`

```typescript
interface SummaryCardProps {
  label: string;
  amount: number;
  accentColor: string;
  isLoading?: boolean;
}
```

- Full width, `rounded-2xl`, `p-4`, `shadow-sm`
- Nominal: `text-2xl font-bold`
- Skeleton `animate-pulse` saat `isLoading=true`

### `<AmountInput />`

```typescript
// Format display real-time
const formatDisplay = (raw: string): string =>
  raw.replace(/\D/g, "")
     .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
// "1500000" → "1.500.000"
// Stored value tetap number murni: 1500000
```

### `<EmptyState />`

| Variant | Teks | Action |
|---------|------|--------|
| `no-transaction` | "Belum ada transaksi. Yuk mulai catat!" | Tombol "Catat Sekarang" → /add |
| `no-partner` | "Pasangan belum terhubung." | Tombol "Hubungkan" → /connect |
| `no-history` | "Tidak ada transaksi di bulan ini." | — |

---

## 11. Utility Functions

```typescript
// src/utils/formatCurrency.ts
export const formatIDR = (amount: number): string
// 1250000 → "Rp 1.250.000"

export const parseIDR = (display: string): number
// "1.250.000" → 1250000

// src/utils/computeAggregation.ts
export const computeSummary = (
  transactions: Transaction[],
  ownerId: string,
  month: number,
  year: number
): FinancialSummary

// src/utils/dateHelper.ts
export const getMonthLabel = (month: number): string
// 3 → "Maret"

export const groupByDate = (
  transactions: Transaction[]
): Record<string, Transaction[]>

export const formatDateHeader = (dateStr: string): string
// "2026-03-28" → "Jumat, 28 Maret 2026"

// src/utils/categoryMeta.ts
export const getCategoryIcon = (slug: string): string
export const getCategoryLabel = (slug: string): string
```

---

## 12. Firebase Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isLinkedPartner(ownerId) {
      return get(/databases/$(database)/documents/users/$(request.auth.uid))
               .data.linkedPartnerId == ownerId;
    }

    // users: hanya bisa baca/edit milik sendiri
    match /users/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }

    // transactions: bisa baca milik sendiri ATAU milik pasangan terhubung
    match /transactions/{transactionId} {
      allow read: if request.auth != null &&
                    (resource.data.ownerId == request.auth.uid ||
                     isLinkedPartner(resource.data.ownerId));

      allow create: if request.auth != null &&
                       request.resource.data.ownerId == request.auth.uid;

      allow update, delete: if request.auth != null &&
                               resource.data.ownerId == request.auth.uid;
    }
  }
}
```

> Deploy rules bersamaan dengan deploy aplikasi. Tanpa rules, semua data bisa dibaca siapapun.

---

## 13. Panduan UX

| Aspek | Spesifikasi |
|-------|-------------|
| Touch target | Minimum `44x44px` semua elemen interaktif |
| Warna Pendapatan | Hijau `#16A34A` |
| Warna Pengeluaran | Merah `#DC2626` |
| Warna Hutang | Oranye `#EA580C` |
| Warna Bayar Hutang | Biru `#2563EB` |
| Format Rupiah | `Rp 1.250.000` — titik ribuan, tanpa desimal |
| Toast feedback | 2 detik setelah aksi berhasil |
| Transisi halaman | Slide horizontal `200ms ease-in-out` |
| Loading state | Skeleton screen, bukan spinner |
| Error state | Teks merah inline di bawah field yang gagal validasi |

---

## 14. Non-Functional Requirements

### 14.1 Keamanan

- Semua Firebase config key di `.env.local`, tidak di-commit ke git
- Security rules Firestore aktif sebelum production
- Semua input di-sanitasi sebelum disimpan (cegah XSS di field `note` dan `creditorName`)
- Route `/dashboard`, `/add`, `/history` dilindungi `<AuthGuard>`

### 14.2 Performa

- Lighthouse Performance score mobile: >= 85
- First Contentful Paint: < 1.5 detik pada jaringan 4G
- Bundle size JS: < 250KB gzipped
- Firestore reads per session dashboard: < 20 dokumen

### 14.3 Aksesibilitas

- Semua `<input>` memiliki `<label>` via `htmlFor`
- Kontras warna: minimal 4.5:1 (WCAG AA)
- Semua tombol memiliki `aria-label` deskriptif

---

## 15. Out-of-Scope (Fase Ini)

- Push notification / FCM
- Grafik tren keuangan
- Ekspor data PDF/CSV
- Foto struk / upload attachment
- Hutang antar pasangan
- Multi-currency
- Dark mode
- Notifikasi reminder jatuh tempo
- Fitur edit / hapus transaksi

---

## 16. Estimasi Milestone

| Milestone | Deliverable | Estimasi |
|-----------|-------------|----------|
| **M1** | Setup Vite + React + TS + Tailwind + Firebase + Routing + BottomNav | 1 hari |
| **M2** | Firebase Auth Google Sign-In + authStore + Login page + AuthGuard | 1 hari |
| **M3** | Firestore service layer + real-time listener hooks + transactionStore | 1 hari |
| **M4** | Halaman Dashboard + SummaryCard + toggle Pribadi/Pasangan | 2 hari |
| **M5** | Halaman Input Transaksi + validasi form + write ke Firestore | 2 hari |
| **M6** | Halaman Riwayat + filter + mode Gabungan + OwnerChip | 2 hari |
| **M7** | Halaman Koneksi Pasangan + batch write Firestore | 1 hari |
| **M8** | Security Rules + PWA config + polish UX + Lighthouse audit | 1 hari |
| **Total** | | **~11 hari kerja** |

---

## 17. Checklist Developer

### Setup (M1–M3)
- [ ] Vite + React + TypeScript berjalan tanpa error
- [ ] Tailwind CSS v4 terkonfigurasi dengan color palette custom
- [ ] React Router v7 terpasang, semua route terdaftar
- [ ] Firebase project dibuat, config di `.env.local`
- [ ] Firebase Auth aktif dengan provider Google diizinkan
- [ ] Firestore dibuat dalam mode production (bukan test mode)
- [ ] BottomNav render dengan 3 tab, navigasi berfungsi
- [ ] Wrapper 480px aktif dan ter-center di desktop

### Auth & Data (M2–M3)
- [ ] Google Sign-In berfungsi dan buat dokumen `users/{uid}` saat pertama login
- [ ] `partnerCode` 6 digit ter-generate otomatis saat register
- [ ] `AuthGuard` redirect ke `/login` jika tidak ada sesi
- [ ] Real-time listener aktif saat login, berhenti saat logout

### Dashboard (M4)
- [ ] 4 SummaryCard menampilkan data `computeSummary()` yang benar
- [ ] Toggle Pribadi/Pasangan mengubah semua card tanpa loading
- [ ] 5 transaksi terbaru tampil sesuai `ownerId` aktif
- [ ] Tab "Pasangan" disabled jika `linkedPartnerId === null`
- [ ] Skeleton tampil saat fetch pertama

### Input Transaksi (M5)
- [ ] Keyboard numerik muncul saat fokus di field nominal
- [ ] Format Rp real-time saat mengetik
- [ ] Grid kategori berubah sesuai tipe
- [ ] Field `creditorName` hanya muncul saat tipe Hutang/Bayar Hutang
- [ ] Tombol Simpan disabled jika validasi gagal
- [ ] Transaksi tersimpan ke Firestore `transactions`
- [ ] Toast sukses muncul setelah simpan

### Riwayat (M6)
- [ ] Filter bulan/tahun reaktif
- [ ] Mode Gabungan tampilkan OwnerChip warna berbeda
- [ ] Transaksi dikelompokkan per tanggal
- [ ] Empty state tampil jika 0 transaksi

### Koneksi Pasangan (M7)
- [ ] Kode 6 digit tampil di `/connect`
- [ ] Input kode memvalidasi ke Firestore
- [ ] Batch write memperbarui kedua dokumen user secara atomik
- [ ] Error state jika kode tidak ditemukan

### Production Ready (M8)
- [ ] Security rules Firestore aktif dan di-test dengan Firebase Emulator
- [ ] Tidak ada API key exposed di source code
- [ ] PWA dapat di-install di Android & iOS
- [ ] Lighthouse mobile score >= 85
- [ ] Tidak ada console error di production build
- [ ] `.gitignore` menyertakan `.env.local` dan `firebase-debug.log`

---

## 18. Appendix — Keputusan yang Ditangguhkan

| Keputusan | Opsi yang Perlu Dievaluasi |
|-----------|---------------------------|
| Edit / Hapus transaksi | Fitur CRUD penuh untuk riwayat |
| Push notification | FCM untuk reminder tagihan bulanan |
| Grafik tren | Chart pendapatan vs pengeluaran per bulan |
| Ekspor laporan | PDF ringkasan bulanan via Cloud Functions |
| Optimasi Firestore reads | Pagination, caching via `enableIndexedDbPersistence()` |
| Unlink pasangan | Alur pemutusan koneksi antar akun |

---

*Dokumen ini siap diserahkan ke developer. Semua keputusan arsitektur sudah final, semua ambiguitas sudah dieliminasi, dan setiap fitur memiliki acceptance criteria yang terukur.*
