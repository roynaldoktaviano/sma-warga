# Lentera — Sistem Poin & Karakter Siswa

Aplikasi web untuk mencatat **pelanggaran** dan **prestasi** siswa, lalu menghitung poin
karakter tiap siswa secara otomatis. Dibangun untuk **SMA Warga Surakarta**.

Versi ini adalah port dari prototipe single-file HTML ke **Next.js 14 + Prisma + PostgreSQL**,
sehingga datanya tersimpan di database sungguhan dan bisa diakses multi-perangkat.

## Stack

- **Next.js 14** (App Router, Server Components, Server Actions)
- **Prisma** ORM + **PostgreSQL** (cocok dengan Neon, Supabase, atau Postgres lokal)
- **Auth** sesi sendiri: password di-hash dengan **bcrypt**, sesi disimpan sebagai **JWT di cookie httpOnly** (pakai `jose`), dijaga oleh **middleware**
- **TypeScript**, font via `next/font` (Inter, Fraunces, Geist Mono)

## Peran & Hak Akses

| Peran | Bisa apa |
|---|---|
| **Kesiswaan** | Lihat semua siswa, tambah siswa, catat kejadian (pelanggaran/prestasi), hapus catatan |
| **BKA** | Sama seperti Kesiswaan |
| **Orang Tua / Wali** | Hanya melihat poin & riwayat **anaknya sendiri** (read-only) |

Pemisahan peran dijaga di middleware (wajib login) dan di tiap halaman (guard `requireStaff` / `requireParent`).

---

## Cara Menjalankan

### 1. Prasyarat
- **Node.js 18.18+** atau **20+**
- Sebuah database **PostgreSQL**. Paling cepat pakai [Neon](https://neon.tech) (gratis) — buat project, lalu salin connection string-nya.

### 2. Install dependency
```bash
npm install
```

### 3. Siapkan environment
```bash
cp .env.example .env
```
Lalu isi `.env`:
- `DATABASE_URL` → connection string PostgreSQL kamu.
  - Neon: `postgresql://user:pass@ep-xxx.aws.neon.tech/lentera?sslmode=require`
  - Lokal: `postgresql://postgres:postgres@localhost:5432/lentera?schema=public`
- `AUTH_SECRET` → string acak panjang. Generate dengan:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
  ```

### 4. Buat tabel & isi data demo
```bash
npm run db:push   # buat tabel dari schema.prisma
npm run db:seed   # isi 1 sekolah, 2 petugas, 8 siswa + akun wali
```

### 5. Jalankan
```bash
npm run dev
```
Buka http://localhost:3000

---

## Akun Demo

| Peran | Username | Sandi |
|---|---|---|
| Kesiswaan | `kesiswaan` | `kesiswaan123` |
| BKA | `bka` | `bka123` |
| Orang Tua | `ortu.andi` | `ortu123` |

Tiap siswa punya akun wali berpola `ortu.<nama_depan>` dengan sandi `ortu123`
(mis. `ortu.bunga`, `ortu.dimas`, dst).

> Sandi demo memang mudah, tapi **disimpan dalam bentuk hash bcrypt** di database — bukan plaintext.

---

## Skrip yang Tersedia

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Mode pengembangan |
| `npm run build` / `npm start` | Build & jalankan mode produksi |
| `npm run db:push` | Sinkronkan schema ke database |
| `npm run db:seed` | Isi ulang data demo |
| `npm run db:reset` | **Reset** database (hapus semua) lalu seed ulang |
| `npm run db:studio` | Buka Prisma Studio (lihat/edit data via GUI) |

---

## Struktur Proyek

```
prisma/
  schema.prisma        # model: Sekolah, Staff, Siswa, OrangTua, Catatan
  seed.ts              # data demo
src/
  middleware.ts        # proteksi route (redirect ke /login bila belum login)
  lib/
    prisma.ts          # Prisma client singleton
    session.ts         # JWT sign/verify (edge-safe, dipakai middleware)
    auth.ts            # cookie sesi + guard requireStaff/requireParent (server-only)
    points.ts          # POIN_AWAL, status, kategori, perhitungan
    format.ts          # format tanggal
  app/
    layout.tsx         # root layout (font + Toaster)
    page.tsx           # redirect sesuai peran
    actions.ts         # server actions: catat, tambah siswa, hapus, logout
    not-found.tsx
    login/
      page.tsx, LoginForm.tsx, actions.ts
    (app)/             # grup route yang butuh login
      layout.tsx       # topbar + guard sesi
      dashboard/page.tsx   # dasbor petugas (roster + statistik)
      siswa/[id]/page.tsx  # detail siswa + ledger (petugas)
      ortu/page.tsx        # pantauan wali (read-only)
  components/
    Topbar, RosterTable, Ledger, Meter, StatusPill, Avatar,
    RecordModalButton, AddStudentModalButton, ModalShell, Toaster, icons
public/
  logo-sma-warga.png   # logo sekolah
```

## Logika Poin

- Setiap siswa mulai dari **100 poin** (`poinAwal`).
- Tiap catatan menyimpan **poin bertanda**: pelanggaran negatif, prestasi positif.
- **Poin saat ini = poin awal + jumlah semua catatan.**
- Status: **≥100 Teladan**, **85–99 Baik**, **70–84 Perlu Perhatian**, **<70 Pembinaan**.

## Catatan Produksi

- Untuk deploy: **Vercel** (frontend) + **Neon** (database) adalah kombinasi paling mulus. Set
  `DATABASE_URL` dan `AUTH_SECRET` di Environment Variables Vercel, lalu jalankan
  `prisma migrate deploy` (atau `db push`) saat rilis.
- Pertimbangkan menambah: ganti password mandiri, audit log, halaman manajemen akun petugas,
  ekspor laporan PDF/Excel, dan rate-limit pada login.
