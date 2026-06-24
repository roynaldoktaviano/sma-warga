import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentPoints, studentStats, statusOf } from "@/lib/points";
import { Avatar } from "@/components/Avatar";
import { StatusPill } from "@/components/StatusPill";
import { Meter } from "@/components/Meter";
import { Ledger } from "@/components/Ledger";
import { RecordModalButton } from "@/components/RecordModalButton";
import { DeleteStudentButton } from "@/components/DeleteStudentButton";
import { UpdateStatusButton } from "@/components/UpdateStatusButton";
import { IconBack } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function SiswaPage({ params }: { params: { id: string } }) {
  await requireStaff();

  const s = await prisma.siswa.findUnique({
    where: { id: params.id },
    include: { catatan: { orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }] } },
  });
  if (!s) notFound();

  const p = currentPoints(s.poinAwal, s.catatan);
  const st = statusOf(p);
  const stt = studentStats(s.catatan);

  return (
    <div className="shell">
      <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ marginBottom: 16, textDecoration: "none" }}>
        <IconBack />
        Kembali
      </Link>

      <div className="detail-grid">
        <div className="card card-pad">
          <div className="profile-top">
            <Avatar name={s.nama} large />
            <div className="profile-id">
              <b>{s.nama}</b>
              <span className="mono">{s.nis}</span>
            </div>
          </div>

          <dl className="info-list">
            <div><dt>NIS</dt><dd className="mono">{s.nis}</dd></div>
            {s.nisn && <div><dt>NISN</dt><dd className="mono">{s.nisn}</dd></div>}
            <div><dt>Kelas</dt><dd>{s.kelas}</dd></div>
            <div><dt>L/P</dt><dd>{s.jenisKelamin === "P" ? "Perempuan" : "Laki-laki"}</dd></div>
            <div><dt>Agama</dt><dd>{s.agama || "—"}</dd></div>
            {s.asalSD && <div><dt>Asal SD</dt><dd>{s.asalSD}</dd></div>}
            {s.statusDL && <div><dt>Domisili</dt><dd>{s.statusDL === "D" ? "Dalam kota" : "Luar kota"}</dd></div>}
          </dl>

          <div className="score-row">
            <div className="score" style={{ color: st.color }}>{p}</div>
            <div className="score-of">poin · dari {s.poinAwal} poin awal</div>
          </div>

          <StatusPill points={p} />
          <Meter points={p} />

          <div className="minis">
            <div className="mini"><div className="mini-num up">{stt.pres}</div><div className="mini-lab">Prestasi</div></div>
            <div className="mini"><div className="mini-num down">{stt.pel}</div><div className="mini-lab">Pelanggaran</div></div>
            <div className="mini"><div className="mini-num up">+{stt.up}</div><div className="mini-lab">Poin bertambah</div></div>
            <div className="mini"><div className="mini-num down">−{stt.down}</div><div className="mini-lab">Poin berkurang</div></div>
          </div>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            <RecordModalButton students={[{ id: s.id, nama: s.nama, kelas: s.kelas }]} presetStudentId={s.id} block />
            <div>
              <div className="info-sub-label">Status Siswa</div>
              <UpdateStatusButton id={s.id} current={s.status} />
            </div>
            <DeleteStudentButton id={s.id} nama={s.nama} />
          </div>
        </div>

        <Ledger catatan={s.catatan} canDelete />
      </div>
    </div>
  );
}
