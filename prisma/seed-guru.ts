// Seed guru SMP Warga — npx tsx prisma/seed-guru.ts
// Hapus akun dummy (guru/gurubk/guruekskul), tambah 19 guru asli + assign mapel
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL } },
});

const DEFAULT_PASSWORD = "12345678";

// username = first name lowercase, no special chars
const GURU: {
  nama: string;
  username: string;
  role: Role;
  mapel: { nama: string; kelas: string }[]; // kelas = "7,8" | "9" | "" (semua)
}[] = [
  {
    nama: "Muhammad Karimuddin, S.HI.",
    username: "karimuddin",
    role: Role.GURU,
    mapel: [{ nama: "Agama Islam", kelas: "" }],
  },
  {
    nama: "Arum Septiana, S.Pd.",
    username: "arum",
    role: Role.GURU,
    mapel: [{ nama: "Agama Kristen", kelas: "" }],
  },
  {
    nama: "Marhenia Elzabeth G. A., S.Pd.",
    username: "marhenia",
    role: Role.GURU,
    mapel: [{ nama: "Agama Katolik", kelas: "" }],
  },
  {
    nama: "Sirat Pramono, S.Pd.",
    username: "sirat",
    role: Role.GURU,
    mapel: [{ nama: "Pendidikan Pancasila", kelas: "" }],
  },
  {
    nama: "Nanerl Ayening Pangestuti, S.Pd.",
    username: "nanerl",
    role: Role.GURU,
    mapel: [{ nama: "Bahasa Indonesia", kelas: "7,8" }],
  },
  {
    nama: "Lina Khoirun Nisa, S.Pd.",
    username: "lina",
    role: Role.GURU,
    mapel: [{ nama: "Bahasa Indonesia", kelas: "9" }],
  },
  {
    nama: "Edria Rifky Anjar Winarsih, S.Pd.",
    username: "edria",
    role: Role.GURU,
    mapel: [{ nama: "Matematika", kelas: "7,8" }],
  },
  {
    nama: "Ari Nurhayati, S.Pd.",
    username: "ari",
    role: Role.GURU,
    mapel: [{ nama: "Matematika", kelas: "8,9" }],
  },
  {
    nama: "Tirsa Putri Kristianti, S.Pd.",
    username: "tirsa",
    role: Role.GURU,
    mapel: [{ nama: "IPA", kelas: "7" }],
  },
  {
    nama: "Ika Purwanti, S.Pd.",
    username: "ika",
    role: Role.GURU,
    mapel: [{ nama: "IPA", kelas: "8,9" }],
  },
  {
    nama: "Meita Indah Setyaputri, S.Pd.",
    username: "meita",
    role: Role.GURU,
    mapel: [{ nama: "IPS", kelas: "" }],
  },
  {
    nama: "Luqfi Nurul Setiawan, S.Pd.",
    username: "luqfi",
    role: Role.GURU,
    mapel: [{ nama: "Bahasa Inggris", kelas: "7,8" }],
  },
  {
    nama: "Rani Tiur Prasasti, S.Pd.",
    username: "rani",
    role: Role.GURU,
    mapel: [{ nama: "Bahasa Inggris", kelas: "8,9" }],
  },
  {
    nama: "Daniel Lindung Rimawan, S.Pd.",
    username: "daniel",
    role: Role.GURU,
    mapel: [{ nama: "Penjasorkes", kelas: "7" }],
  },
  {
    nama: "Alexander Bayu Hardika Putra, S.Pd.",
    username: "alexander",
    role: Role.GURU,
    mapel: [{ nama: "Penjasorkes", kelas: "8,9" }],
  },
  {
    nama: "Putri Erpy Cahyaning Asri, S.Sn.",
    username: "putri",
    role: Role.GURU,
    mapel: [{ nama: "Seni Tari", kelas: "" }],
  },
  {
    nama: "Bintoro Dewa Setyawan, S.Pd.",
    username: "bintoro",
    role: Role.GURU,
    mapel: [{ nama: "Informatika", kelas: "" }],
  },
  {
    nama: "Ani Lestariningsih, S.S., S.Pd.",
    username: "ani",
    role: Role.GURU,
    mapel: [{ nama: "Bahasa Jawa", kelas: "" }],
  },
  {
    nama: "Chrisanta Kezia Yemima, M.Pd.",
    username: "chrisanta",
    role: Role.GURU_BK,
    mapel: [{ nama: "Bimbingan Konseling", kelas: "" }],
  },
];

// Akun dummy yang dihapus (selain kesiswaan & kepsek)
const DUMMY_USERNAMES = ["guru", "gurubk", "guruekskul"];

async function main() {
  const sekolah = await prisma.sekolah.findFirst();
  if (!sekolah) {
    console.error("Sekolah tidak ditemukan. Jalankan db:seed terlebih dahulu.");
    process.exit(1);
  }

  // Hapus akun dummy
  const deleted = await prisma.staff.deleteMany({
    where: { username: { in: DUMMY_USERNAMES } },
  });
  console.log(`Hapus ${deleted.count} akun dummy.\n`);

  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  let added = 0;

  for (const g of GURU) {
    // Skip jika username sudah ada
    const exists = await prisma.staff.findUnique({ where: { username: g.username } });
    if (exists) {
      console.log(`  ~ ${g.nama} (sudah ada, skip)`);
      continue;
    }

    const staff = await prisma.staff.create({
      data: { nama: g.nama, username: g.username, password: hash, role: g.role, sekolahId: sekolah.id },
    });

    // Assign mapel
    for (const m of g.mapel) {
      const mapel = await prisma.mataPelajaran.findUnique({
        where: { sekolahId_nama_kelas: { sekolahId: sekolah.id, nama: m.nama, kelas: m.kelas } },
      });
      if (mapel) {
        await prisma.staffMapel.create({ data: { staffId: staff.id, mataPelajaranId: mapel.id } });
        const kelasStr = m.kelas ? `Kelas ${m.kelas}` : "Semua kelas";
        console.log(`  + ${g.nama} → ${m.nama} [${kelasStr}]`);
      } else {
        console.warn(`  ! Mapel "${m.nama}" (kelas="${m.kelas}") tidak ditemukan`);
      }
    }
    added++;
  }

  console.log(`\nSelesai: ${added} guru ditambahkan.`);
  console.log(`Password default semua guru: ${DEFAULT_PASSWORD}`);
  console.log(`Username = nama depan lowercase (karimuddin, arum, marhenia, …)`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
