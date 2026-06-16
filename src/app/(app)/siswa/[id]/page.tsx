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
              <span>
                {s.kelas} · NIS <span className="mono">{s.nis}</span>
              </span>
            </div>
          </div>

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

          <div style={{ marginTop: 18 }}>
            <RecordModalButton students={[{ id: s.id, nama: s.nama, kelas: s.kelas }]} presetStudentId={s.id} block />
          </div>
        </div>

        <Ledger catatan={s.catatan} canDelete />
      </div>
    </div>
  );
}
