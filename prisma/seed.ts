// ============================================================
// Lentera — seed data demo
//   npm run db:seed
// ============================================================
import { PrismaClient, Role, Jenis } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type RecSeed = {
  jenis: Jenis;
  kategori: string;
  poin: number; // magnitudo (selalu positif di sini)
  keterangan: string;
  tanggal: string; // YYYY-MM-DD
  oleh: "KS" | "BK"; // pencatat
};

type SiswaSeed = {
  nis: string;
  nama: string;
  kelas: string;
  records: RecSeed[];
};

const SISWA: SiswaSeed[] = [
  {
    nis: "24001", nama: "Andi Pratama", kelas: "XII IPA 1",
    records: [
      { jenis: Jenis.PRESTASI, kategori: "Aktif organisasi (OSIS/ekskul)", poin: 15, keterangan: "Menjadi koordinator acara Class Meeting.", tanggal: "2026-05-04", oleh: "BK" },
      { jenis: Jenis.PELANGGARAN, kategori: "Terlambat masuk sekolah", poin: 5, keterangan: "Terlambat 20 menit tanpa keterangan.", tanggal: "2026-05-20", oleh: "KS" },
      { jenis: Jenis.PELANGGARAN, kategori: "Membawa HP saat KBM", poin: 10, keterangan: "Bermain HP saat pelajaran Matematika.", tanggal: "2026-06-02", oleh: "KS" },
      { jenis: Jenis.PELANGGARAN, kategori: "Berkata kasar / tidak sopan", poin: 15, keterangan: "Berkata tidak sopan kepada guru piket.", tanggal: "2026-06-12", oleh: "BK" },
    ],
  },
  {
    nis: "24002", nama: "Bunga Lestari", kelas: "XI IPS 2",
    records: [
      { jenis: Jenis.PRESTASI, kategori: "Juara lomba akademik", poin: 30, keterangan: "Juara 1 Olimpiade Matematika tingkat kota.", tanggal: "2026-04-28", oleh: "KS" },
      { jenis: Jenis.PRESTASI, kategori: "Mewakili sekolah", poin: 20, keterangan: "Mewakili sekolah dalam lomba debat tingkat provinsi.", tanggal: "2026-06-09", oleh: "BK" },
      { jenis: Jenis.PELANGGARAN, kategori: "Terlambat masuk sekolah", poin: 5, keterangan: "Terlambat saat jam pertama.", tanggal: "2026-05-15", oleh: "KS" },
    ],
  },
  {
    nis: "24003", nama: "Citra Dewi", kelas: "X-3",
    records: [
      { jenis: Jenis.PRESTASI, kategori: "Perilaku terpuji / jujur", poin: 10, keterangan: "Membantu membersihkan kelas tanpa diminta.", tanggal: "2026-06-05", oleh: "BK" },
    ],
  },
  {
    nis: "24004", nama: "Dimas Saputra", kelas: "XII IPA 2",
    records: [
      { jenis: Jenis.PELANGGARAN, kategori: "Terlambat masuk sekolah", poin: 5, keterangan: "Terlambat tiga kali dalam sepekan.", tanggal: "2026-05-08", oleh: "KS" },
      { jenis: Jenis.PELANGGARAN, kategori: "Membawa HP saat KBM", poin: 10, keterangan: "Bermain game saat jam pelajaran.", tanggal: "2026-05-19", oleh: "KS" },
      { jenis: Jenis.PELANGGARAN, kategori: "Membolos / keluar tanpa izin", poin: 25, keterangan: "Tidak masuk tanpa keterangan saat ujian harian.", tanggal: "2026-05-27", oleh: "KS" },
      { jenis: Jenis.PELANGGARAN, kategori: "Berkata kasar / tidak sopan", poin: 15, keterangan: "Menggunakan kata kasar saat ditegur.", tanggal: "2026-06-03", oleh: "BK" },
      { jenis: Jenis.PRESTASI, kategori: "Perilaku terpuji / jujur", poin: 10, keterangan: "Menunjukkan perbaikan sikap setelah sesi konseling.", tanggal: "2026-06-11", oleh: "BK" },
    ],
  },
  {
    nis: "24005", nama: "Eka Putri", kelas: "XI IPA 1",
    records: [
      { jenis: Jenis.PRESTASI, kategori: "Aktif organisasi (OSIS/ekskul)", poin: 15, keterangan: "Anggota aktif tim Jurnalistik sekolah.", tanggal: "2026-05-02", oleh: "BK" },
      { jenis: Jenis.PELANGGARAN, kategori: "Tidak mengerjakan tugas/PR", poin: 10, keterangan: "Tidak mengumpulkan tugas Biologi.", tanggal: "2026-05-22", oleh: "KS" },
      { jenis: Jenis.PELANGGARAN, kategori: "Membawa HP saat KBM", poin: 10, keterangan: "Menggunakan HP saat ulangan.", tanggal: "2026-06-01", oleh: "KS" },
      { jenis: Jenis.PELANGGARAN, kategori: "Terlambat masuk sekolah", poin: 5, keterangan: "Terlambat 10 menit.", tanggal: "2026-06-08", oleh: "KS" },
    ],
  },
  {
    nis: "24006", nama: "Fajar Nugroho", kelas: "X-1",
    records: [
      { jenis: Jenis.PELANGGARAN, kategori: "Tidak mengerjakan tugas/PR", poin: 10, keterangan: "Belum menyelesaikan tugas kelompok.", tanggal: "2026-05-12", oleh: "KS" },
      { jenis: Jenis.PELANGGARAN, kategori: "Membawa HP saat KBM", poin: 10, keterangan: "Bermain HP saat pelajaran.", tanggal: "2026-05-29", oleh: "KS" },
      { jenis: Jenis.PELANGGARAN, kategori: "Terlambat masuk sekolah", poin: 5, keterangan: "Terlambat tanpa keterangan.", tanggal: "2026-06-06", oleh: "KS" },
    ],
  },
  {
    nis: "24007", nama: "Gita Maharani", kelas: "XII IPS 1",
    records: [],
  },
  {
    nis: "24008", nama: "Hadi Wijaya", kelas: "XI IPA 2",
    records: [
      { jenis: Jenis.PRESTASI, kategori: "Membantu guru / teman", poin: 10, keterangan: "Membantu teman yang kesulitan memahami pelajaran.", tanggal: "2026-05-10", oleh: "BK" },
      { jenis: Jenis.PELANGGARAN, kategori: "Terlambat masuk sekolah", poin: 5, keterangan: "Terlambat saat upacara.", tanggal: "2026-05-25", oleh: "KS" },
      { jenis: Jenis.PELANGGARAN, kategori: "Membawa HP saat KBM", poin: 10, keterangan: "Menggunakan HP saat KBM berlangsung.", tanggal: "2026-06-13", oleh: "KS" },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding Lentera…");

  // Bersihkan (urut sesuai dependensi)
  await prisma.catatan.deleteMany();
  await prisma.siswa.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.sekolah.deleteMany();

  const sekolah = await prisma.sekolah.create({
    data: { nama: "SMP Warga Surakarta" },
  });

  const hashStaff = await bcrypt.hash("kesiswaan123", 10);
  const kesiswaan = await prisma.staff.create({
    data: {
      nama: "Pak Hendra (Kesiswaan)",
      username: "kesiswaan",
      password: hashStaff,
      role: Role.KESISWAAN,
      sekolahId: sekolah.id,
    },
  });

  const hashBka = await bcrypt.hash("bka123", 10);
  const bka = await prisma.staff.create({
    data: {
      nama: "Bu Sari (BKA)",
      username: "bka",
      password: hashBka,
      role: Role.BKA,
      sekolahId: sekolah.id,
    },
  });

  const pencatatMap = { KS: kesiswaan, BK: bka } as const;
  const siswaHash = await bcrypt.hash("siswa123", 10);

  for (const s of SISWA) {
    const siswa = await prisma.siswa.create({
      data: {
        nis: s.nis,
        nama: s.nama,
        kelas: s.kelas,
        username: s.nis,
        password: siswaHash,
        poinAwal: 100,
        sekolahId: sekolah.id,
      },
    });

    for (const r of s.records) {
      const staff = pencatatMap[r.oleh];
      await prisma.catatan.create({
        data: {
          siswaId: siswa.id,
          jenis: r.jenis,
          kategori: r.kategori,
          poin: r.jenis === Jenis.PELANGGARAN ? -r.poin : r.poin,
          keterangan: r.keterangan,
          tanggal: new Date(r.tanggal + "T00:00:00Z"),
          pencatatId: staff.id,
          pencatatNama: staff.nama,
        },
      });
    }
  }

  const total = await prisma.siswa.count();
  console.log(`✅ Selesai. ${total} siswa dibuat untuk ${sekolah.nama}.`);
  console.log("   Login staff: kesiswaan/kesiswaan123 · bka/bka123");
  console.log("   Login siswa: <NIS>/siswa123 (mis. 24001/siswa123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
