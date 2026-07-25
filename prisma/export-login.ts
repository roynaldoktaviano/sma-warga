// Export data login ke spreadsheet — npx tsx prisma/export-login.ts
// Sheet 1: Guru (password dirandom + update DB)
// Sheet 2: Siswa (password = NIS)
// Sheet 3: Orang Tua (sama dengan akun siswa)
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";
import path from "path";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL } },
});

// Generate random password yang mudah dibaca (tanpa 0/O, 1/l/I)
function randomPassword(len = 10): string {
  const chars = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

const ROLE_LABEL: Record<string, string> = {
  KESISWAAN: "Kesiswaan",
  KEPSEK:    "Kepala Sekolah",
  GURU:      "Guru",
  GURU_BK:   "Guru BK",
  GURU_EKSKUL: "Guru Ekskul",
};

async function main() {
  // ── 1. Ambil semua staff ────────────────────────────────────
  const staff = await prisma.staff.findMany({
    orderBy: { nama: "asc" },
    select: { id: true, nama: true, username: true, role: true },
  });

  // ── 2. Generate password baru untuk setiap staff ───────────
  console.log("Mengupdate password guru…");
  const staffRows: Record<string, string | number>[] = [];
  for (const s of staff) {
    const plain = randomPassword();
    const hash  = await bcrypt.hash(plain, 10);
    await prisma.staff.update({ where: { id: s.id }, data: { password: hash } });
    staffRows.push({
      "No":         staffRows.length + 1,
      "Nama":       s.nama,
      "Username":   s.username,
      "Password":   plain,
      "Role":       ROLE_LABEL[s.role] ?? s.role,
      "URL Login":  "https://smawarga.sch.id/login",
    });
    console.log(`  ✓ ${s.nama.padEnd(40)} ${plain}`);
  }
  console.log(`${staffRows.length} password guru diperbarui.\n`);

  // ── 3. Ambil semua siswa ────────────────────────────────────
  const siswa = await prisma.siswa.findMany({
    orderBy: [{ kelas: "asc" }, { nama: "asc" }],
    select: { nama: true, nis: true, nisn: true, kelas: true, jenisKelamin: true },
  });

  const siswaRows: Record<string, string | number>[] = siswa.map((s, i) => ({
    "No":         i + 1,
    "Kelas":      s.kelas,
    "NIS":        s.nis,
    "Nama":       s.nama,
    "L/P":        s.jenisKelamin,
    "Username":   s.nisn ?? "",
    "Password":   s.nis,   // password = NIS
    "URL Login":  "https://smawarga.sch.id/login",
  }));

  // ── 4. Sheet orang tua — username: ortu-{nisn}, password = NIS siswa ──
  const ortuRows: Record<string, string | number>[] = siswa.map((s, i) => ({
    "No":              i + 1,
    "Kelas":           s.kelas,
    "NIS Putra/Putri": s.nis,
    "Nama Siswa":      s.nama,
    "Username":        `ortu-${s.nisn ?? ""}`,
    "Password (NIS)":  s.nis,
    "URL Login":       "https://smawarga.sch.id/login",
  }));

  // ── 5. Buat workbook ───────────────────────────────────────
  const wb = XLSX.utils.book_new();

  const wsGuru  = XLSX.utils.json_to_sheet(staffRows);
  const wsSiswa = XLSX.utils.json_to_sheet(siswaRows);
  const wsOrtu  = XLSX.utils.json_to_sheet(ortuRows);

  // Lebar kolom
  wsGuru["!cols"]  = [{ wch: 4 }, { wch: 38 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 28 }];
  wsSiswa["!cols"] = [{ wch: 4 }, { wch: 8  }, { wch: 8  }, { wch: 38 }, { wch: 5  }, { wch: 16 }, { wch: 10 }, { wch: 28 }];
  wsOrtu["!cols"]  = [{ wch: 4 }, { wch: 8  }, { wch: 12 }, { wch: 38 }, { wch: 22 }, { wch: 12 }, { wch: 28 }];

  XLSX.utils.book_append_sheet(wb, wsGuru,  "Guru & Staff");
  XLSX.utils.book_append_sheet(wb, wsSiswa, "Siswa");
  XLSX.utils.book_append_sheet(wb, wsOrtu,  "Orang Tua");

  // ── 6. Simpan file ─────────────────────────────────────────
  const outPath = path.resolve("data-login-smpwarga.xlsx");
  XLSX.writeFile(wb, outPath);
  console.log(`\nFile tersimpan: ${outPath}`);
  console.log(`  Sheet "Guru & Staff" : ${staffRows.length} akun`);
  console.log(`  Sheet "Siswa"        : ${siswaRows.length} akun`);
  console.log(`  Sheet "Orang Tua"    : ${ortuRows.length} entri`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
