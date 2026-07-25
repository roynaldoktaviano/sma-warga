// Seed mata pelajaran SMP Warga — npx tsx prisma/seed-mapel.ts
// Hapus semua mapel lama lalu isi ulang dengan struktur baru (nama bersih + kelas terpisah)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL } },
});

// kelas: array kosong = semua kelas; ["7"] = kelas 7 saja; ["8","9"] = kelas 8 dan 9
const MAPEL = [
  { kode: "A", nama: "Agama Islam",            kelas: []          },
  { kode: "A", nama: "Agama Kristen",           kelas: []          },
  { kode: "A", nama: "Agama Katolik",           kelas: []          },
  { kode: "B", nama: "Pendidikan Pancasila",    kelas: []          },
  { kode: "C", nama: "Bahasa Indonesia",        kelas: ["7", "8"]  },
  { kode: "D", nama: "Bahasa Indonesia",        kelas: ["9"]       },
  { kode: "E", nama: "Matematika",              kelas: ["7", "8"]  },
  { kode: "F", nama: "Matematika",              kelas: ["8", "9"]  },
  { kode: "G", nama: "IPA",                     kelas: ["7"]       },
  { kode: "H", nama: "IPA",                     kelas: ["8", "9"]  },
  { kode: "I", nama: "IPS",                     kelas: []          },
  { kode: "J", nama: "Bahasa Inggris",          kelas: ["7", "8"]  },
  { kode: "K", nama: "Bahasa Inggris",          kelas: ["8", "9"]  },
  { kode: "L", nama: "Penjasorkes",             kelas: ["7"]       },
  { kode: "M", nama: "Penjasorkes",             kelas: ["8", "9"]  },
  { kode: "N", nama: "Seni Tari",               kelas: []          },
  { kode: "O", nama: "Informatika",             kelas: []          },
  { kode: "P", nama: "Bahasa Jawa",             kelas: []          },
  { kode: "Q", nama: "Bimbingan Konseling",     kelas: []          },
];

async function main() {
  const sekolah = await prisma.sekolah.findFirst();
  if (!sekolah) {
    console.error("Sekolah tidak ditemukan. Jalankan db:seed terlebih dahulu.");
    process.exit(1);
  }

  // Hapus semua mapel lama (cascade ke StaffMapel)
  const deleted = await prisma.mataPelajaran.deleteMany({ where: { sekolahId: sekolah.id } });
  console.log(`Hapus ${deleted.count} mapel lama.`);

  for (const m of MAPEL) {
    const kelas = m.kelas.sort().join(",");
    await prisma.mataPelajaran.create({
      data: { nama: m.nama, kode: m.kode, kelas, sekolahId: sekolah.id },
    });
    const kelasStr = kelas ? `Kelas ${kelas}` : "Semua kelas";
    console.log(`  + ${m.kode.padEnd(3)} ${m.nama.padEnd(25)} [${kelasStr}]`);
  }

  console.log(`\nSelesai: ${MAPEL.length} mata pelajaran ditambahkan.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
