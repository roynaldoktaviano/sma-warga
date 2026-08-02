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

// --- perhitungan dari daftar catatan (poin sudah bertanda) ---
// Hanya catatan VERIFIED yang mempengaruhi poin
export type CatatanLike = { poin: number; statusVerif?: string };

export function currentPoints(poinAwal: number, catatan: CatatanLike[]): number {
  return catatan
    .filter(c => !c.statusVerif || c.statusVerif === "VERIFIED")
    .reduce((acc, c) => acc + c.poin, poinAwal);
}

export type Stats = { pres: number; pel: number; up: number; down: number; pending: number };

export function studentStats(catatan: CatatanLike[]): Stats {
  let pres = 0, pel = 0, up = 0, down = 0, pending = 0;
  for (const c of catatan) {
    if (c.statusVerif === "PENDING") { pending++; continue; }
    if (c.poin >= 0) { pres++; up += c.poin; }
    else { pel++; down += Math.abs(c.poin); }
  }
  return { pres, pel, up, down, pending };
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
