import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentPoints, statusOf } from "@/lib/points";
import { daysSince } from "@/lib/format";
import { RosterTable } from "@/components/RosterTable";
import { AddStudentModalButton } from "@/components/AddStudentModalButton";
import { ImportCSVModalButton } from "@/components/ImportCSVModalButton";
import { ExportCSVButton } from "@/components/ExportCSVButton";
import { RecordModalButton } from "@/components/RecordModalButton";
import { KenaikanKelasButton } from "@/components/KenaikanKelasButton";
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
    nisn: s.nisn,
    kelas: s.kelas,
    jenisKelamin: s.jenisKelamin,
    agama: s.agama,
    asalSD: s.asalSD,
    statusDL: s.statusDL,
    status: s.status,
    poin: currentPoints(s.poinAwal, s.catatan),
  }));

  const aktif = rows.filter(r => r.status === "AKTIF");
  const total = aktif.length;
  const rata = total ? Math.round(aktif.reduce((a, r) => a + r.poin, 0) / total) : 0;
  const perhatian = aktif.filter((r) => {
    const k = statusOf(r.poin).key;
    return k === "perhatian" || k === "pembinaan";
  }).length;
  let week = 0;
  siswa.filter(s => s.status === "AKTIF").forEach((s) => s.catatan.forEach((c) => { if (daysSince(c.tanggal) <= 7) week++; }));

  const studentOpts = siswa.map((s) => ({ id: s.id, nama: s.nama, kelas: s.kelas }));

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <div className="eyebrow">Dasbor</div>
          <h1 className="page-title">Daftar Siswa</h1>
        </div>
        <div className="page-actions">
          <KenaikanKelasButton />
          <ExportCSVButton students={rows} />
          <ImportCSVModalButton />
          <AddStudentModalButton />
          <RecordModalButton students={studentOpts} />
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-icon stat-icon--blue"><IconUsers /></div>
          <div className="stat-label">Total Siswa</div>
          <div className="stat-num">{total}</div>
          <div className="stat-foot">terdaftar di sistem</div>
        </div>
        <div className="stat">
          <div className="stat-icon stat-icon--green"><IconGauge /></div>
          <div className="stat-label">Rata-rata Poin</div>
          <div className="stat-num">{rata}</div>
          <div className="stat-foot">{statusOf(rata).label} secara umum</div>
        </div>
        <div className="stat">
          <div className="stat-icon stat-icon--amber"><IconWarn /></div>
          <div className="stat-label">Perlu Perhatian</div>
          <div className="stat-num">{perhatian}</div>
          <div className="stat-foot">di bawah poin baik</div>
        </div>
        <div className="stat">
          <div className="stat-icon stat-icon--purple"><IconPen /></div>
          <div className="stat-label">Catatan Pekan Ini</div>
          <div className="stat-num">{week}</div>
          <div className="stat-foot">7 hari terakhir</div>
        </div>
      </div>

      <RosterTable rows={rows} />
    </div>
  );
}
