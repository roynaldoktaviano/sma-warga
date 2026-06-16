const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// Format Date/ISO menjadi "12 Jun 2026"
export function fmtTanggal(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d + "T00:00:00") : d;
  if (isNaN(date.getTime())) return String(d);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

// ISO YYYY-MM-DD hari ini (untuk default input tanggal)
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysSince(d: Date | string): number {
  const date = typeof d === "string" ? new Date(d + "T00:00:00") : d;
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}
