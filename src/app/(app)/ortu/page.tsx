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

const STATUS_LABEL: Record<string, string> = { HADIR: "Hadir", IZIN: "Izin", SAKIT: "Sakit", ALPA: "Alpa" };

function formatTgl(d: Date | string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default async function OrtuPage() {
  const session = await requireSiswa();

  const siswa = await prisma.siswa.findUnique({
    where: { id: session.sub },
    include: {
      catatan: {
        orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
        select: {
          id: true, poin: true, kategori: true, keterangan: true,
          tanggal: true, pencatatNama: true,
          statusVerif: true, verifikasiWakaNama: true, verifikasiKepsekNama: true,
        },
      },
      presensi: {
        orderBy: { tanggal: "desc" },
        select: { id: true, tanggal: true, status: true, keterangan: true },
      },
      ekskulAnggota: {
        select: { ekskul: { select: { id: true, nama: true } } },
      },
      presensiEkskul: {
        orderBy: { tanggal: "desc" },
        select: {
          id: true, tanggal: true, status: true, keterangan: true,
          ekskul: { select: { id: true, nama: true } },
        },
      },
    },
  });
  if (!siswa) redirect("/login");

  const p   = currentPoints(siswa.poinAwal, siswa.catatan);
  const st  = statusOf(p);
  const stt = studentStats(siswa.catatan);
  const first = siswa.nama.split(" ")[0];

  const absen = {
    hadir: siswa.presensi.filter(r => r.status === "HADIR").length,
    izin:  siswa.presensi.filter(r => r.status === "IZIN").length,
    sakit: siswa.presensi.filter(r => r.status === "SAKIT").length,
    alpa:  siswa.presensi.filter(r => r.status === "ALPA").length,
  };

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <div className="eyebrow">Pantauan Siswa</div>
          <h1 className="page-title">Halo, {first}</h1>
        </div>
      </div>

      {/* ── Row 1: Profile hero + Ledger tatib ── */}
      <div className="ortu-cols">
        {/* kiri: profil + poin */}
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
            <div className="mini"><div className="mini-num up">+{stt.up}</div><div className="mini-lab">Tambah</div></div>
            <div className="mini"><div className="mini-num down">−{stt.down}</div><div className="mini-lab">Kurang</div></div>
          </div>

          <div className="note">
            <IconInfo />
            <p>
              Mulai dari {siswa.poinAwal} poin. <b>Prestasi menambah</b>,{" "}
              <b>pelanggaran mengurangi</b>. Untuk konsultasi hubungi wali kelas.
            </p>
          </div>
        </div>

        {/* kanan: catatan tatib */}
        <Ledger catatan={siswa.catatan} canDelete={false} />
      </div>

      {/* ── Row 2: Presensi + Ekskul ── */}
      <div className="ortu-cols-bottom">

        {/* kiri: riwayat presensi sekolah */}
        <div>
          <div className="section-block-head">
            <h2 className="section-block-title">Riwayat Presensi</h2>
            <span className="section-block-count">{siswa.presensi.length} pertemuan</span>
          </div>

          {siswa.presensi.length === 0 ? (
            <div className="card card-pad riwayat-empty">Belum ada data presensi.</div>
          ) : (
            <>
              <div className="minis" style={{ marginBottom: 12 }}>
                <div className="mini"><div className="mini-num up">{absen.hadir}</div><div className="mini-lab">Hadir</div></div>
                <div className="mini"><div className="mini-num">{absen.izin}</div><div className="mini-lab">Izin</div></div>
                <div className="mini"><div className="mini-num">{absen.sakit}</div><div className="mini-lab">Sakit</div></div>
                <div className="mini"><div className="mini-num down">{absen.alpa}</div><div className="mini-lab">Alpa</div></div>
              </div>
              <div className="card riwayat-list">
                {siswa.presensi.map(r => (
                  <div key={r.id} className="riwayat-row">
                    <span className="riwayat-date">{formatTgl(r.tanggal)}</span>
                    <span className={`absen-pill absen-pill--${r.status.toLowerCase()}`}>{STATUS_LABEL[r.status]}</span>
                    <span className="riwayat-ket">{r.keterangan || ""}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* kanan: ekstrakulikuler */}
        <div>
          <div className="section-block-head">
            <h2 className="section-block-title">Ekstrakulikuler</h2>
          </div>

          {siswa.ekskulAnggota.length === 0 ? (
            <div className="card card-pad riwayat-empty">Tidak terdaftar di ekstrakulikuler.</div>
          ) : (
            <div className="card card-pad">
              <div className="ekskul-tag-row">
                {siswa.ekskulAnggota.map(ea => (
                  <span key={ea.ekskul.id} className="ekskul-tag">{ea.ekskul.nama}</span>
                ))}
              </div>

              {siswa.presensiEkskul.length > 0 && (
                <>
                  <div className="riwayat-sub-label">Riwayat Presensi Ekskul</div>
                  <div className="riwayat-list" style={{ margin: "0 -16px -16px" }}>
                    {siswa.presensiEkskul.map(pe => (
                      <div key={pe.id} className="riwayat-row riwayat-row--ekskul">
                        <span className="riwayat-ekskul-name">{pe.ekskul.nama}</span>
                        <span className="riwayat-date">{formatTgl(pe.tanggal)}</span>
                        <span className={`absen-pill absen-pill--${pe.status.toLowerCase()}`}>{STATUS_LABEL[pe.status]}</span>
                        <span className="riwayat-ket">{pe.keterangan || ""}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
