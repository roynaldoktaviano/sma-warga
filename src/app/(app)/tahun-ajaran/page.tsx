import { requireStaff, canManage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AddTahunAjaranButton } from "@/components/AddTahunAjaranButton";
import { TahunAjaranStatusButton } from "@/components/TahunAjaranStatusButton";
import { SetActiveTahunAjaranButton } from "@/components/SetActiveTahunAjaranButton";
import { IconFlag, IconCalendar, IconGrid } from "@/components/icons";

function semLabel(s: string) { return s === "GANJIL" ? "Ganjil" : "Genap"; }

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PERSIAPAN: "Persiapan",
  BERJALAN: "Berjalan",
  SELESAI: "Selesai",
};

export default async function TahunAjaranPage() {
  const session = await requireStaff();
  if (!canManage(session.role)) redirect("/dashboard");

  const tahunList = await prisma.tahunAjaran.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { ekskul: true, kelas: true } },
    },
  });

  const aktivId = tahunList.find(t => t.isActive)?.id;

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <div className="eyebrow">Master Data</div>
          <h1 className="page-title">Tahun Ajaran</h1>
        </div>
        <div className="page-actions">
          <AddTahunAjaranButton />
        </div>
      </div>

      {tahunList.length === 0 ? (
        <div className="empty">
          <IconFlag />
          <b>Belum ada tahun ajaran</b>
          <p>Tambah tahun ajaran untuk mulai mengelola data sekolah.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="ta-list-head">
            <span>Tahun Ajaran</span>
            <span>Status</span>
            <span>Kelas</span>
            <span>Ekskul</span>
            <span>Aktif</span>
            <span />
          </div>
          {tahunList.map((ta) => (
            <div key={ta.id} className="ta-list-row">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="ta-list-icon">
                  <IconFlag />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{ta.nama}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>
                    <span className={"ta-sem-chip ta-sem-chip--" + ta.semester.toLowerCase()}>
                      {semLabel(ta.semester)}
                    </span>
                  </div>
                </div>
              </div>
              <span className={"ta-status ta-status--" + ta.status.toLowerCase()}>
                {STATUS_LABEL[ta.status] ?? ta.status}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--ink-soft)" }}>
                <IconGrid style={{ width: 13, height: 13 }} />
                {ta._count.kelas} kelas
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--ink-soft)" }}>
                <IconCalendar style={{ width: 13, height: 13 }} />
                {ta._count.ekskul} ekskul
              </div>
              <div>
                {ta.isActive ? (
                  <span className="ta-active-badge">Aktif</span>
                ) : (
                  <SetActiveTahunAjaranButton id={ta.id} nama={`${ta.nama} ${semLabel(ta.semester)}`} />
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <TahunAjaranStatusButton
                  id={ta.id}
                  status={ta.status as "PERSIAPAN" | "BERJALAN" | "SELESAI"}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 20, padding: "14px 18px", background: "var(--accent-soft)", borderRadius: "var(--radius)", border: "1px solid #bfdbfe", fontSize: 13, color: "#1e40af", lineHeight: 1.6 }}>
        <b>Cara penggunaan:</b> Buat tahun ajaran baru, ubah status ke <b>Berjalan</b>, lalu klik <b>Jadikan Aktif</b>.
        Tahun ajaran aktif akan dipakai di seluruh sistem — kelas, ekskul, dan catatan siswa.
      </div>
    </div>
  );
}
