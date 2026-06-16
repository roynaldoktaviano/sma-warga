import { redirect } from "next/navigation";
import { requireSiswa } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentPoints, studentStats, statusOf, parentLine } from "@/lib/points";
import { Avatar } from "@/components/Avatar";
import { StatusPill } from "@/components/StatusPill";
import { Meter } from "@/components/Meter";
import { Ledger } from "@/components/Ledger";
import { IconInfo } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function OrtuPage() {
  const session = await requireSiswa();

  const siswa = await prisma.siswa.findUnique({
    where: { id: session.sub },
    include: { catatan: { orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }] } },
  });
  if (!siswa) redirect("/login");

  const p = currentPoints(siswa.poinAwal, siswa.catatan);
  const st = statusOf(p);
  const stt = studentStats(siswa.catatan);
  const first = siswa.nama.split(" ")[0];

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <div className="eyebrow">Pantauan Siswa</div>
          <h1 className="page-title">Poin {first}</h1>
        </div>
      </div>

      <div className="parent-hero">
        <div className="parent-hero-top">
          <Avatar name={siswa.nama} large />
          <div className="profile-id">
            <b>{siswa.nama}</b>
            <span>
              {siswa.kelas} · NIS <span className="mono">{siswa.nis}</span>
            </span>
          </div>
        </div>

        <div className="score-row">
          <div className="score" style={{ color: st.color }}>{p}</div>
          <div className="score-of">poin saat ini</div>
        </div>

        <StatusPill points={p} />

        <p className="parent-msg">
          Poin {first} saat ini <em style={{ color: st.color }}>{p}</em> — {st.label}.
        </p>
        <div className="score-cap">{parentLine(st.key)}</div>

        <Meter points={p} />

        <div className="minis">
          <div className="mini"><div className="mini-num up">{stt.pres}</div><div className="mini-lab">Prestasi</div></div>
          <div className="mini"><div className="mini-num down">{stt.pel}</div><div className="mini-lab">Pelanggaran</div></div>
          <div className="mini"><div className="mini-num up">+{stt.up}</div><div className="mini-lab">Poin bertambah</div></div>
          <div className="mini"><div className="mini-num down">−{stt.down}</div><div className="mini-lab">Poin berkurang</div></div>
        </div>

        <div className="note">
          <IconInfo />
          <p>
            Setiap siswa mulai dari {siswa.poinAwal} poin. <b>Prestasi menambah</b> poin,{" "}
            <b>pelanggaran mengurangi</b> poin. Catatan dibuat oleh Kesiswaan dan BKA. Untuk
            konsultasi, silakan hubungi wali kelas.
          </p>
        </div>
      </div>

      <Ledger catatan={siswa.catatan} canDelete={false} />
    </div>
  );
}
