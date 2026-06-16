import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentPoints, statusOf } from "@/lib/points";
import { daysSince } from "@/lib/format";
import { RosterTable } from "@/components/RosterTable";
import { AddStudentModalButton } from "@/components/AddStudentModalButton";
import { ImportCSVModalButton } from "@/components/ImportCSVModalButton";
import { RecordModalButton } from "@/components/RecordModalButton";
import { IconUsers, IconGauge, IconWarn, IconPen } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireStaff();

  const siswa = await prisma.siswa.findMany({
    include: { catatan: { select: { poin: true, tanggal: true } } },
    orderBy: { nama: "asc" },
  });

  const rows = siswa.map((s) => ({
    id: s.id,
    nama: s.nama,
    nis: s.nis,
    kelas: s.kelas,
    poin: currentPoints(s.poinAwal, s.catatan),
  }));

  const total = rows.length;
  const rata = total ? Math.round(rows.reduce((a, r) => a + r.poin, 0) / total) : 0;
  const perhatian = rows.filter((r) => {
    const k = statusOf(r.poin).key;
    return k === "perhatian" || k === "pembinaan";
  }).length;
  let week = 0;
  siswa.forEach((s) => s.catatan.forEach((c) => { if (daysSince(c.tanggal) <= 7) week++; }));

  const studentOpts = siswa.map((s) => ({ id: s.id, nama: s.nama, kelas: s.kelas }));

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <div className="eyebrow">Dasbor</div>
          <h1 className="page-title">Daftar Siswa</h1>
        </div>
        <div className="page-actions">
          <ImportCSVModalButton />
          <AddStudentModalButton />
          <RecordModalButton students={studentOpts} />
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-label"><IconUsers />Total Siswa</div>
          <div className="stat-num">{total}</div>
          <div className="stat-foot">terdaftar di sistem</div>
        </div>
        <div className="stat">
          <div className="stat-label"><IconGauge />Rata-rata Poin</div>
          <div className="stat-num">{rata}</div>
          <div className="stat-foot">{statusOf(rata).label} secara umum</div>
        </div>
        <div className="stat">
          <div className="stat-label"><IconWarn />Perlu Perhatian</div>
          <div className="stat-num">{perhatian}</div>
          <div className="stat-foot">
            <span className="stat-mini-dot" style={{ background: "var(--warn)" }} /> di bawah poin baik
          </div>
        </div>
        <div className="stat">
          <div className="stat-label"><IconPen />Catatan Pekan Ini</div>
          <div className="stat-num">{week}</div>
          <div className="stat-foot">7 hari terakhir</div>
        </div>
      </div>

      <RosterTable rows={rows} />
    </div>
  );
}
