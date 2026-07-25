import { requireStaff, canManage, canViewTatib } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AddMapelButton } from "@/components/AddMapelButton";
import { DeleteMapelButton } from "@/components/DeleteMapelButton";
import { IconBook } from "@/components/icons";

export const dynamic = "force-dynamic";

function kelasLabel(kelas: string) {
  if (!kelas) return null;
  return kelas.split(",").map(k => (
    <span key={k} className="mapel-kelas-badge">Kelas {k}</span>
  ));
}

export default async function MapelPage() {
  const session = await requireStaff();
  if (!canViewTatib(session.role)) redirect("/dashboard");

  const isManager = canManage(session.role);

  const mapelList = await prisma.mataPelajaran.findMany({
    orderBy: [{ kode: "asc" }, { nama: "asc" }, { kelas: "asc" }],
    include: {
      guru: {
        include: { staff: { select: { id: true, nama: true, role: true } } },
        orderBy: { staff: { nama: "asc" } },
      },
    },
  });

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <div className="eyebrow">Master Data</div>
          <h1 className="page-title">Mata Pelajaran</h1>
        </div>
        {isManager && (
          <div className="page-actions">
            <AddMapelButton />
          </div>
        )}
      </div>

      {mapelList.length === 0 ? (
        <div className="empty">
          <IconBook />
          <b>Belum ada mata pelajaran</b>
          <p>Tambah mata pelajaran untuk mulai mengatur penugasan guru.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="mapel-table-head">
            <span>Kode</span>
            <span>Mata Pelajaran</span>
            <span>Kelas</span>
            <span>Guru Pengampu</span>
            {isManager && <span />}
          </div>
          {mapelList.map(m => (
            <div key={m.id} className={"mapel-table-row" + (isManager ? "" : " mapel-table-row--noaction")}>
              <div>
                {m.kode
                  ? <span className="mapel-kode-badge">{m.kode}</span>
                  : <span style={{ color: "var(--ink-faint)", fontSize: 12 }}>—</span>}
              </div>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{m.nama}</span>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                {m.kelas
                  ? kelasLabel(m.kelas)
                  : <span className="mapel-kelas-badge mapel-kelas-badge--all">Semua</span>}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {m.guru.length === 0
                  ? <span style={{ fontSize: 12.5, color: "var(--ink-faint)", fontStyle: "italic" }}>Belum ada guru</span>
                  : m.guru.map(g => (
                    <span key={g.staff.id} className="mapel-guru-chip">
                      {g.staff.nama}
                      <span className="mapel-guru-role">{ROLE_LABEL[g.staff.role as keyof typeof ROLE_LABEL] ?? g.staff.role}</span>
                    </span>
                  ))
                }
              </div>
              {isManager && (
                <DeleteMapelButton id={m.id} nama={m.nama} />
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 8, padding: "12px 16px", fontSize: 12.5, color: "var(--ink-faint)" }}>
        {mapelList.length} mata pelajaran · Penugasan guru diatur di halaman <a href="/guru" style={{ color: "var(--accent)" }}>Guru</a>
      </div>
    </div>
  );
}
