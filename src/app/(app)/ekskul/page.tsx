import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canViewEkskul, canManage } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IconUsers } from "@/components/icons";
import { AddTahunAjaranButton } from "@/components/AddTahunAjaranButton";
import { AddEkskulButton } from "@/components/AddEkskulButton";
import { TahunAjaranStatusButton } from "@/components/TahunAjaranStatusButton";

export const dynamic = "force-dynamic";

const TA_LABEL: Record<string, string> = {
  PERSIAPAN: "Persiapan",
  BERJALAN:  "Berjalan",
  SELESAI:   "Selesai",
};

export default async function EkskulPage() {
  const session = await requireStaff();
  if (!canViewEkskul(session.role)) redirect("/dashboard");

  const isManager = canManage(session.role);

  const [tahunList, allStaff] = await Promise.all([
    prisma.tahunAjaran.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      ekskul: {
        include: {
          _count: { select: { anggota: true } },
          guru: { include: { staff: { select: { nama: true } } } },
        },
        orderBy: { nama: "asc" },
      },
    },
  }),
    isManager
      ? prisma.staff.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true, role: true } })
      : Promise.resolve([]),
  ]);

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <div className="eyebrow">Ekstrakulikuler</div>
          <h1 className="page-title">Kelola Ekskul</h1>
        </div>
        <div className="page-actions">
          {isManager && <AddTahunAjaranButton />}
        </div>
      </div>

      {tahunList.length === 0 ? (
        <div className="empty">
          <IconUsers />
          <b>Belum ada tahun ajaran</b>
          <p>Tambah tahun ajaran untuk mulai mengelola ekskul.</p>
        </div>
      ) : (
        tahunList.map((ta) => (
          <div key={ta.id} style={{ marginBottom: 24 }}>
            <div className="page-head" style={{ marginBottom: 10, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{ta.nama}</h2>
                <span className={"ta-status ta-status--" + ta.status.toLowerCase()}>
                  {TA_LABEL[ta.status] ?? ta.status}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {isManager && ta.status === "PERSIAPAN" && (
                  <AddEkskulButton tahunAjaranId={ta.id} allStaff={allStaff} />
                )}
                {isManager && (
                  <TahunAjaranStatusButton id={ta.id} status={ta.status as "PERSIAPAN" | "BERJALAN" | "SELESAI"} />
                )}
              </div>
            </div>

            <div className="card" style={{ overflow: "hidden" }}>
              {ta.ekskul.length === 0 ? (
                <div style={{ padding: "20px 18px", color: "var(--ink-faint)", fontSize: 13 }}>
                  Belum ada ekskul di tahun ajaran ini.
                </div>
              ) : (
                <>
                  <div className="ekskul-head">
                    <span>Nama Ekskul</span>
                    <span>Pembina</span>
                    <span>Anggota</span>
                    <span>Status</span>
                  </div>
                  {ta.ekskul.map((e) => (
                    <Link
                      key={e.id}
                      href={`/ekskul/${e.id}`}
                      className="ekskul-row ekskul-row--link"
                    >
                      <span style={{ fontWeight: 500 }}>{e.nama}</span>
                      <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                        {e.guru.map(g => g.staff.nama).join(", ") || "—"}
                      </span>
                      <span style={{ fontSize: 13 }}>{e._count.anggota} siswa</span>
                      <span className={"ta-status ta-status--" + ta.status.toLowerCase()}>
                        {TA_LABEL[ta.status] ?? ta.status}
                      </span>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
