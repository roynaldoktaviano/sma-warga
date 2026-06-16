// ============================================================
// Lentera — logika poin & status (port dari prototipe)
// ============================================================

export const POIN_AWAL = 100; // poin awal default tiap siswa
export const METER_MAX = 150; // batas visual meteran

export type StatusKey = "teladan" | "baik" | "perhatian" | "pembinaan";

export type Status = {
  key: StatusKey;
  label: string;
  color: string; // CSS var
  bg: string; // CSS var
};

export function statusOf(p: number): Status {
  if (p >= 100) return { key: "teladan", label: "Teladan", color: "var(--good)", bg: "var(--good-bg)" };
  if (p >= 85) return { key: "baik", label: "Baik", color: "var(--info)", bg: "var(--info-bg)" };
  if (p >= 70) return { key: "perhatian", label: "Perlu Perhatian", color: "var(--warn)", bg: "var(--warn-bg)" };
  return { key: "pembinaan", label: "Pembinaan", color: "var(--bad)", bg: "var(--bad-bg)" };
}

export function parentLine(key: StatusKey): string {
  switch (key) {
    case "teladan":
      return "Perilaku dan prestasinya sangat baik. Pertahankan dan terus apresiasi, ya.";
    case "baik":
      return "Secara umum baik. Tetap dampingi agar terus berkembang.";
    case "perhatian":
      return "Mulai perlu perhatian. Yuk komunikasikan bersama wali kelas.";
    default:
      return "Perlu pembinaan bersama. Sekolah siap berkoordinasi dengan Bapak/Ibu.";
  }
}

// Jenis kategori — "poin" di sini adalah magnitudo (selalu positif)
export type KategoriItem = { label: string; poin: number };

export const KATEGORI: Record<"pelanggaran" | "prestasi", KategoriItem[]> = {
  pelanggaran: [
    { label: "Terlambat masuk sekolah", poin: 5 },
    { label: "Tidak memakai atribut/seragam lengkap", poin: 5 },
    { label: "Tidak mengerjakan tugas/PR", poin: 10 },
    { label: "Membawa HP saat KBM", poin: 10 },
    { label: "Tidak mengikuti upacara", poin: 10 },
    { label: "Berkata kasar / tidak sopan", poin: 15 },
    { label: "Membolos / keluar tanpa izin", poin: 25 },
    { label: "Merusak fasilitas sekolah", poin: 30 },
    { label: "Berkelahi", poin: 50 },
    { label: "Merokok / membawa rokok", poin: 50 },
    { label: "Lainnya", poin: 0 },
  ],
  prestasi: [
    { label: "Kehadiran penuh (sebulan)", poin: 10 },
    { label: "Membantu guru / teman", poin: 10 },
    { label: "Perilaku terpuji / jujur", poin: 10 },
    { label: "Aktif organisasi (OSIS/ekskul)", poin: 15 },
    { label: "Mewakili sekolah", poin: 20 },
    { label: "Juara lomba non-akademik", poin: 25 },
    { label: "Juara lomba akademik", poin: 30 },
    { label: "Lainnya", poin: 0 },
  ],
};

// --- perhitungan dari daftar catatan (poin sudah bertanda) ---
export type CatatanLike = { poin: number };

export function currentPoints(poinAwal: number, catatan: CatatanLike[]): number {
  return catatan.reduce((acc, c) => acc + c.poin, poinAwal);
}

export type Stats = { pres: number; pel: number; up: number; down: number };

export function studentStats(catatan: CatatanLike[]): Stats {
  let pres = 0, pel = 0, up = 0, down = 0;
  for (const c of catatan) {
    if (c.poin >= 0) { pres++; up += c.poin; }
    else { pel++; down += Math.abs(c.poin); }
  }
  return { pres, pel, up, down };
}

export function initials(name: string): string {
  const p = String(name).trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? p[0]?.[1] ?? "")).toUpperCase();
}

const AV = ["#3f5f7d", "#2f6f7d", "#4f5f6f", "#2f6f6f", "#41587d", "#566270", "#2f7d6f", "#4a5a7d", "#3f6f8d"];

export function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AV[h % AV.length];
}
