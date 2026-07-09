// Role helpers — aman diimport dari Client Component maupun Server Component
// (tidak ada server-only, tidak ada next/headers)

export type StaffRole = "KESISWAAN" | "KEPSEK" | "GURU" | "GURU_BK" | "GURU_EKSKUL";

export const ROLE_LABEL: Record<StaffRole, string> = {
  KESISWAAN:   "Waka Kesiswaan",
  KEPSEK:      "Kepala Sekolah",
  GURU:        "Guru",
  GURU_BK:     "Guru BK",
  GURU_EKSKUL: "Guru Ekskul",
};

export const canVerify        = (r?: string) => r === "KESISWAAN" || r === "KEPSEK";
export const canInput         = (r?: string) => r === "KESISWAAN" || r === "KEPSEK" || r === "GURU";
export const canViewTatib     = (r?: string) => r !== "GURU_EKSKUL";
export const canViewEkskul    = (r?: string) => r === "KESISWAAN" || r === "KEPSEK" || r === "GURU_EKSKUL";
export const canManage        = (r?: string) => r === "KESISWAAN";
export const canDownload      = (r?: string) => r === "KESISWAAN" || r === "KEPSEK" || r === "GURU_BK";
export const canDeleteStudent = (r?: string) => r === "KESISWAAN" || r === "KEPSEK";
