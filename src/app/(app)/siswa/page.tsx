import { requireStaff, canManage, canDownload } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentPoints } from "@/lib/points";
import { RosterTable } from "@/components/RosterTable";
import { AddStudentModalButton } from "@/components/AddStudentModalButton";
import { ImportCSVModalButton } from "@/components/ImportCSVModalButton";
import { ExportCSVButton } from "@/components/ExportCSVButton";
import { KenaikanKelasButton } from "@/components/KenaikanKelasButton";

export const dynamic = "force-dynamic";

export default async function SiswaPage() {
  const session = await requireStaff();
  const role = session.role ?? "";

  const siswa = await prisma.siswa.findMany({
    include: { catatan: { select: { poin: true, statusVerif: true } } },
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

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <div className="eyebrow">Data Siswa</div>
          <h1 className="page-title">Daftar Siswa</h1>
        </div>
        <div className="page-actions">
          {canManage(role) && <KenaikanKelasButton />}
          {canDownload(role) && <ExportCSVButton students={rows} />}
          {canManage(role) && <ImportCSVModalButton />}
          {canManage(role) && <AddStudentModalButton />}
        </div>
      </div>

      <RosterTable rows={rows} />
    </div>
  );
}
