// ============================================================
// SMP Warga Surakarta — seed data
//   npm run db:seed
// ============================================================
import { PrismaClient, Role, Jenis } from "@prisma/client";
import bcrypt from "bcryptjs";

// Seed butuh direct connection (bukan pooler) supaya bisa jalankan multi-query
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL } },
});

// ── Kategori Pelanggaran & Prestasi — range poin (min–max) ────
const KATEGORI_PELANGGARAN = [
  { nama: "Kerapihan dan Pakaian", poinMin: 1, poinMax: 10 },
  { nama: "Kedisiplinan Waktu", poinMin: 1, poinMax: 15 },
  { nama: "Sikap dan Sopan Santun", poinMin: 5, poinMax: 20 },
  { nama: "Ketertiban Belajar", poinMin: 5, poinMax: 20 },
  { nama: "Pelanggaran Berat", poinMin: 20, poinMax: 50 },
];
const KATEGORI_PRESTASI = [
  { nama: "Kedisiplinan dan Keteladanan", poinMin: 5, poinMax: 15 },
  { nama: "Organisasi dan Kepemimpinan", poinMin: 5, poinMax: 20 },
  { nama: "Non-Akademik / Bakat Minat", poinMin: 10, poinMax: 25 },
  { nama: "Akademik", poinMin: 10, poinMax: 30 },
  { nama: "Prestasi Tingkat Nasional/Internasional", poinMin: 30, poinMax: 50 },
];

// ── Akun Staf ────────────────────────────────────────────────
const STAFF = [
  { nama: "Budi Santoso, S.Pd.",      username: "kesiswaan", password: "kesiswaan123", role: Role.KESISWAAN   },
  { nama: "Dra. Sri Wahyuni, M.Pd.",  username: "kepsek",    password: "kepsek123",    role: Role.KEPSEK      },
  { nama: "Agus Purnomo, S.Pd.",      username: "guru",      password: "guru123",       role: Role.GURU        },
  { nama: "Dewi Rahayu, S.Psi.",      username: "gurubk",    password: "gurubk123",    role: Role.GURU_BK     },
  { nama: "Hendra Wijaya, S.Pd.",     username: "guruekskul",password: "guruekskul123",role: Role.GURU_EKSKUL },
];

// ── Data Siswa ────────────────────────────────────────────────
type RecSeed = {
  jenis: Jenis;
  kategori: string;
  poin: number;
  keterangan: string;
  tanggal: string;
  oleh: "KS" | "BK";
};

type SiswaSeed = {
  nis: string;
  nisn: string;
  nama: string;
  kelas: string;
  jenisKelamin: "L" | "P";
  records: RecSeed[];
};

const SISWA: SiswaSeed[] = [
  // ── Kelas VII ──
  {
    nis: "24001", nisn: "0124001001", nama: "Adi Nugroho",       kelas: "VII A", jenisKelamin: "L",
    records: [
      { jenis: Jenis.PRESTASI,    kategori: "Membantu guru / teman",        poin: 10, keterangan: "Aktif membantu teman yang kesulitan.",       tanggal: "2026-04-15", oleh: "BK" },
      { jenis: Jenis.PELANGGARAN, kategori: "Terlambat masuk sekolah",      poin: 5,  keterangan: "Terlambat 15 menit tanpa keterangan.",        tanggal: "2026-05-06", oleh: "KS" },
    ],
  },
  {
    nis: "24002", nisn: "0124001002", nama: "Bella Kusuma",       kelas: "VII A", jenisKelamin: "P",
    records: [
      { jenis: Jenis.PRESTASI,    kategori: "Juara lomba akademik",         poin: 30, keterangan: "Juara 2 Olimpiade IPA tingkat kecamatan.",    tanggal: "2026-04-22", oleh: "KS" },
      { jenis: Jenis.PRESTASI,    kategori: "Kehadiran penuh (sebulan)",    poin: 10, keterangan: "Kehadiran 100% bulan April.",                 tanggal: "2026-05-01", oleh: "KS" },
    ],
  },
  {
    nis: "24003", nisn: "0124001003", nama: "Cahya Permadi",      kelas: "VII B", jenisKelamin: "L",
    records: [
      { jenis: Jenis.PELANGGARAN, kategori: "Tidak mengerjakan tugas/PR",   poin: 10, keterangan: "Tidak mengumpulkan tugas Matematika.",        tanggal: "2026-05-08", oleh: "KS" },
      { jenis: Jenis.PELANGGARAN, kategori: "Membawa HP saat KBM",          poin: 10, keterangan: "Bermain HP saat jam pelajaran.",              tanggal: "2026-05-20", oleh: "KS" },
    ],
  },
  {
    nis: "24004", nisn: "0124001004", nama: "Dina Safitri",       kelas: "VII B", jenisKelamin: "P",
    records: [
      { jenis: Jenis.PRESTASI,    kategori: "Perilaku terpuji / jujur",    poin: 10, keterangan: "Mengembalikan dompet yang ditemukan.",         tanggal: "2026-05-14", oleh: "BK" },
    ],
  },
  {
    nis: "24005", nisn: "0124001005", nama: "Erik Prasetyo",      kelas: "VII C", jenisKelamin: "L",
    records: [
      { jenis: Jenis.PELANGGARAN, kategori: "Berkata kasar / tidak sopan",  poin: 15, keterangan: "Berkata tidak sopan kepada teman.",           tanggal: "2026-05-10", oleh: "BK" },
      { jenis: Jenis.PELANGGARAN, kategori: "Terlambat masuk sekolah",      poin: 5,  keterangan: "Terlambat saat upacara bendera.",             tanggal: "2026-05-19", oleh: "KS" },
      { jenis: Jenis.PRESTASI,    kategori: "Perilaku terpuji / jujur",    poin: 10, keterangan: "Menunjukkan perbaikan setelah konseling.",     tanggal: "2026-06-02", oleh: "BK" },
    ],
  },

  // ── Kelas VIII ──
  {
    nis: "23001", nisn: "0123001001", nama: "Fani Oktavia",       kelas: "VIII A", jenisKelamin: "P",
    records: [
      { jenis: Jenis.PRESTASI,    kategori: "Mewakili sekolah",             poin: 20, keterangan: "Mewakili sekolah dalam lomba debat.",         tanggal: "2026-04-18", oleh: "KS" },
      { jenis: Jenis.PRESTASI,    kategori: "Aktif organisasi (OSIS/ekskul)", poin: 15, keterangan: "Bendahara OSIS aktif.",                     tanggal: "2026-05-03", oleh: "BK" },
    ],
  },
  {
    nis: "23002", nisn: "0123001002", nama: "Galang Saputra",     kelas: "VIII A", jenisKelamin: "L",
    records: [
      { jenis: Jenis.PELANGGARAN, kategori: "Membolos / keluar tanpa izin", poin: 25, keterangan: "Tidak masuk tanpa keterangan 2 hari.",        tanggal: "2026-05-13", oleh: "KS" },
      { jenis: Jenis.PELANGGARAN, kategori: "Membawa HP saat KBM",          poin: 10, keterangan: "Menggunakan HP saat ulangan harian.",         tanggal: "2026-05-27", oleh: "KS" },
      { jenis: Jenis.PELANGGARAN, kategori: "Berkata kasar / tidak sopan",  poin: 15, keterangan: "Menggunakan kata kasar saat ditegur guru.",   tanggal: "2026-06-04", oleh: "BK" },
    ],
  },
  {
    nis: "23003", nisn: "0123001003", nama: "Hana Putri",         kelas: "VIII B", jenisKelamin: "P",
    records: [
      { jenis: Jenis.PRESTASI,    kategori: "Juara lomba non-akademik",     poin: 25, keterangan: "Juara 1 lomba tari tingkat kota.",            tanggal: "2026-04-25", oleh: "KS" },
      { jenis: Jenis.PELANGGARAN, kategori: "Terlambat masuk sekolah",      poin: 5,  keterangan: "Terlambat 10 menit.",                        tanggal: "2026-05-16", oleh: "KS" },
    ],
  },
  {
    nis: "23004", nisn: "0123001004", nama: "Ivan Mahendra",      kelas: "VIII B", jenisKelamin: "L",
    records: [
      { jenis: Jenis.PELANGGARAN, kategori: "Tidak mengikuti upacara",      poin: 10, keterangan: "Tidak hadir upacara bendera tanpa izin.",     tanggal: "2026-05-05", oleh: "KS" },
      { jenis: Jenis.PELANGGARAN, kategori: "Tidak mengerjakan tugas/PR",   poin: 10, keterangan: "Tugas IPS tidak dikumpulkan 2 kali.",         tanggal: "2026-05-23", oleh: "KS" },
    ],
  },
  {
    nis: "23005", nisn: "0123001005", nama: "Julia Anggraeni",    kelas: "VIII C", jenisKelamin: "P",
    records: [
      { jenis: Jenis.PRESTASI,    kategori: "Kehadiran penuh (sebulan)",    poin: 10, keterangan: "Kehadiran 100% bulan Mei.",                   tanggal: "2026-06-01", oleh: "KS" },
      { jenis: Jenis.PRESTASI,    kategori: "Membantu guru / teman",        poin: 10, keterangan: "Membantu piket sekolah secara sukarela.",     tanggal: "2026-06-07", oleh: "BK" },
    ],
  },

  // ── Kelas IX ──
  {
    nis: "22001", nisn: "0122001001", nama: "Kevin Wibowo",       kelas: "IX A", jenisKelamin: "L",
    records: [
      { jenis: Jenis.PRESTASI,    kategori: "Juara lomba akademik",         poin: 30, keterangan: "Juara 1 OSN Matematika tingkat kota.",        tanggal: "2026-04-10", oleh: "KS" },
      { jenis: Jenis.PRESTASI,    kategori: "Mewakili sekolah",             poin: 20, keterangan: "Mewakili sekolah di ajang robotik provinsi.", tanggal: "2026-05-09", oleh: "KS" },
    ],
  },
  {
    nis: "22002", nisn: "0122001002", nama: "Layla Ramadhani",    kelas: "IX A", jenisKelamin: "P",
    records: [
      { jenis: Jenis.PRESTASI,    kategori: "Aktif organisasi (OSIS/ekskul)", poin: 15, keterangan: "Ketua OSIS periode 2025/2026.",              tanggal: "2026-04-07", oleh: "BK" },
      { jenis: Jenis.PELANGGARAN, kategori: "Terlambat masuk sekolah",      poin: 5,  keterangan: "Terlambat 5 menit.",                          tanggal: "2026-05-28", oleh: "KS" },
    ],
  },
  {
    nis: "22003", nisn: "0122001003", nama: "Mega Susanti",       kelas: "IX B", jenisKelamin: "P",
    records: [
      { jenis: Jenis.PELANGGARAN, kategori: "Merusak fasilitas sekolah",    poin: 30, keterangan: "Merusak kursi di kelas.",                     tanggal: "2026-05-07", oleh: "KS" },
      { jenis: Jenis.PELANGGARAN, kategori: "Membawa HP saat KBM",          poin: 10, keterangan: "Menggunakan HP saat KBM.",                    tanggal: "2026-05-21", oleh: "KS" },
      { jenis: Jenis.PELANGGARAN, kategori: "Berkata kasar / tidak sopan",  poin: 15, keterangan: "Berkata kasar kepada teman sekelas.",         tanggal: "2026-06-03", oleh: "BK" },
    ],
  },
  {
    nis: "22004", nisn: "0122001004", nama: "Naufal Hakim",       kelas: "IX B", jenisKelamin: "L",
    records: [
      { jenis: Jenis.PRESTASI,    kategori: "Juara lomba non-akademik",     poin: 25, keterangan: "Juara 2 lomba pencak silat tingkat kota.",    tanggal: "2026-04-30", oleh: "KS" },
      { jenis: Jenis.PRESTASI,    kategori: "Kehadiran penuh (sebulan)",    poin: 10, keterangan: "Kehadiran 100% bulan April.",                 tanggal: "2026-05-01", oleh: "KS" },
    ],
  },
  {
    nis: "22005", nisn: "0122001005", nama: "Olivia Handayani",   kelas: "IX C", jenisKelamin: "P",
    records: [],
  },
];

// ─────────────────────────────────────────────────────────────
async function main() {
  console.log("Seeding SMP Warga Surakarta…");

  await prisma.catatan.deleteMany();
  await prisma.presensi.deleteMany();
  await prisma.prestasi.deleteMany();
  await prisma.siswa.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.kategoriPelanggaran.deleteMany();
  await prisma.kategoriPrestasi.deleteMany();
  await prisma.sekolah.deleteMany();

  const sekolah = await prisma.sekolah.create({
    data: { nama: "SMP Warga Surakarta" },
  });

  await prisma.kategoriPelanggaran.createMany({
    data: KATEGORI_PELANGGARAN.map(k => ({ ...k, sekolahId: sekolah.id })),
  });
  await prisma.kategoriPrestasi.createMany({
    data: KATEGORI_PRESTASI.map(k => ({ ...k, sekolahId: sekolah.id })),
  });

  // Buat semua akun staf
  const staffMap: Record<"KS" | "BK", Awaited<ReturnType<typeof prisma.staff.create>>> = {} as never;
  for (const s of STAFF) {
    const hash = await bcrypt.hash(s.password, 10);
    const created = await prisma.staff.create({
      data: { nama: s.nama, username: s.username, password: hash, role: s.role, sekolahId: sekolah.id },
    });
    if (s.role === Role.KESISWAAN) (staffMap as Record<string, typeof created>).KS = created;
    if (s.role === Role.GURU_BK)   (staffMap as Record<string, typeof created>).BK = created;
  }

  // Buat semua siswa — password default = NIS
  for (const s of SISWA) {
    const hash = await bcrypt.hash(s.nis, 10);
    const siswa = await prisma.siswa.create({
      data: {
        nis: s.nis, nisn: s.nisn, nama: s.nama, kelas: s.kelas,
        jenisKelamin: s.jenisKelamin,
        username: s.nisn,
        password: hash,
        poinAwal: 100,
        sekolahId: sekolah.id,
      },
    });

    for (const r of s.records) {
      const pencatat = (staffMap as Record<string, typeof staffMap.KS>)[r.oleh];
      await prisma.catatan.create({
        data: {
          siswaId: siswa.id,
          jenis: r.jenis,
          kategori: r.kategori,
          poin: r.jenis === Jenis.PELANGGARAN ? -r.poin : r.poin,
          keterangan: r.keterangan,
          tanggal: new Date(r.tanggal + "T00:00:00Z"),
          pencatatId: pencatat.id,
          pencatatNama: pencatat.nama,
        },
      });
    }
  }

  const total = await prisma.siswa.count();
  console.log(`Selesai. ${total} siswa, ${STAFF.length} akun staf.`);
  console.log("");
  console.log("Akun login staf:");
  for (const s of STAFF) {
    console.log(`  ${s.username.padEnd(12)} / ${s.password.padEnd(16)}  (${s.role})`);
  }
  console.log("");
  console.log("Akun login siswa: NISN sebagai username, NIS sebagai password");
  console.log("  Contoh: 0124001001 / 24001  (Adi Nugroho, VII A)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
