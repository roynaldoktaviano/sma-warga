import { requireStaff, canVerify, canViewTatib, canManage } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AddStaffModalButton } from "@/components/AddStaffModalButton";
import { DeleteStaffButton } from "@/components/DeleteStaffButton";
import { AssignMapelButton } from "@/components/AssignMapelButton";
import { IconUser } from "@/components/icons";

export const dynamic = "force-dynamic";

const ROLE_COLOR: Record<string, string> = {
  KESISWAAN:   "guru-role--kesiswaan",
  KEPSEK:      "guru-role--kepsek",
  GURU:        "guru-role--guru",
  GURU_BK:     "guru-role--bk",
  GURU_EKSKUL: "guru-role--ekskul",
};

export default async function GuruPage() {
  const session = await requireStaff();
  if (!canViewTatib(session.role)) redirect("/dashboard");

  const isAdmin   = canVerify(session.role);
  const isManager = canManage(session.role);

  const [allStaff, allMapel] = await Promise.all([
    prisma.staff.findMany({
      orderBy: [{ role: "asc" }, { nama: "asc" }],
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        waliKelas: { select: { nama: true }, take: 3 },
        ekskulGuru: { include: { ekskul: { select: { nama: true } } }, take: 4 },
        mapel: {
          include: { mataPelajaran: { select: { id: true, nama: true, kode: true } } },
          orderBy: { mataPelajaran: { nama: "asc" } },
        },
      },
    }),
    isManager
      ? prisma.mataPelajaran.findMany({
          orderBy: [{ kode: "asc" }, { nama: "asc" }],
          select: { id: true, nama: true, kode: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <div className="eyebrow">Akademik</div>
          <h1 className="page-title">Guru & Petugas</h1>
        </div>
        {isAdmin && (
          <div className="page-actions">
            <AddStaffModalButton />
          </div>
        )}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div className="guru-table-head">
          <span>Nama</span>
          <span>Role</span>
          <span>Mata Pelajaran</span>
          <span>Wali Kelas</span>
          <span>Ekskul</span>
          {isAdmin && <span />}
        </div>

        {allStaff.length === 0 ? (
          <div className="empty" style={{ padding: "32px 24px" }}>
            <IconUser />
            <b>Belum ada petugas</b>
            <p>Tambah akun guru atau petugas untuk memulai.</p>
          </div>
        ) : (
          allStaff.map(s => (
            <div key={s.id} className={"guru-table-row" + (isAdmin ? "" : " guru-table-row--noaction")}>
              <div className="guru-nama-cell">
                <div className="guru-avatar">{s.nama.trim()[0]?.toUpperCase()}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.nama}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-faint)", fontFamily: "var(--mono)" }}>@{s.username}</div>
                </div>
              </div>
              <span className={"guru-role-badge " + (ROLE_COLOR[s.role] ?? "")}>
                {ROLE_LABEL[s.role as keyof typeof ROLE_LABEL] ?? s.role}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                {s.mapel.length === 0
                  ? <span style={{ fontSize: 12.5, color: "var(--ink-faint)", fontStyle: "italic" }}>—</span>
                  : s.mapel.map(m => (
                    <span key={m.mataPelajaran.id} className="mapel-chip">
                      {m.mataPelajaran.kode && <b>{m.mataPelajaran.kode}</b>}
                      {m.mataPelajaran.nama}
                    </span>
                  ))
                }
                {isManager && (
                  <AssignMapelButton
                    staffId={s.id}
                    namaGuru={s.nama}
                    allMapel={allMapel}
                    currentIds={s.mapel.map(m => m.mataPelajaran.id)}
                  />
                )}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                {s.waliKelas.length > 0
                  ? s.waliKelas.map(k => k.nama).join(", ")
                  : <span style={{ color: "var(--ink-faint)" }}>—</span>}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                {s.ekskulGuru.length > 0
                  ? s.ekskulGuru.map(g => g.ekskul.nama).join(", ")
                  : <span style={{ color: "var(--ink-faint)" }}>—</span>}
              </div>
              {isAdmin && (
                <DeleteStaffButton id={s.id} isSelf={s.id === session.sub} />
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 8, padding: "12px 16px", fontSize: 12.5, color: "var(--ink-faint)" }}>
        Total {allStaff.length} akun terdaftar
      </div>
    </div>
  );
}
