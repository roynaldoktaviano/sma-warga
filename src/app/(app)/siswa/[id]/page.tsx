import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff, canVerify as checkCanVerify, canInput, canManage } from "@/lib/auth";
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

const STATUS_LABEL: Record<string, string> = { HADIR: "Hadir", IZIN: "Izin", SAKIT: "Sakit", ALPA: "Alpa" };

function formatTgl(d: Date | string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default async function SiswaPage({ params }: { params: { id: string } }) {
  const session = await requireStaff();
  const role = session.role ?? "";

  const s = await prisma.siswa.findUnique({
    where: { id: params.id },
    include: {
      catatan: {
        orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
        select: {
          id: true, poin: true, kategori: true, keterangan: true,
          tanggal: true, pencatatNama: true,
          statusVerif: true,
          verifikasiWakaNama: true,
          verifikasiKepsekNama: true,
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
  if (!s) notFound();

  const [kategoriPelanggaran, kategoriPrestasi] = await Promise.all([
    prisma.kategoriPelanggaran.findMany({ where: { sekolahId: s.sekolahId }, orderBy: { nama: "asc" }, select: { id: true, nama: true, poin: true } }),
    prisma.kategoriPrestasi.findMany({ where: { sekolahId: s.sekolahId }, orderBy: { nama: "asc" }, select: { id: true, nama: true, poin: true } }),
  ]);

  const p = currentPoints(s.poinAwal, s.catatan);
  const st = statusOf(p);
  const stt = studentStats(s.catatan);

  const absen = {
    hadir: s.presensi.filter(r => r.status === "HADIR").length,
    izin:  s.presensi.filter(r => r.status === "IZIN").length,
    sakit: s.presensi.filter(r => r.status === "SAKIT").length,
    alpa:  s.presensi.filter(r => r.status === "ALPA").length,
  };

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
            {canInput(role) && (
              <RecordModalButton
                students={[{ id: s.id, nama: s.nama, kelas: s.kelas }]}
                presetStudentId={s.id}
                block
                kategoriPelanggaran={kategoriPelanggaran}
                kategoriPrestasi={kategoriPrestasi}
              />
            )}
            {canManage(role) && (
              <div>
                <div className="info-sub-label">Status Siswa</div>
                <UpdateStatusButton id={s.id} current={s.status} />
              </div>
            )}
            {canManage(role) && <DeleteStudentButton id={s.id} nama={s.nama} />}
          </div>
        </div>

        <Ledger
          catatan={s.catatan}
          canDelete={canInput(role)}
          canVerify={checkCanVerify(role)}
          role={role}
        />
      </div>

      {/* ── Presensi + Ekskul (2 kolom) ─────────────────── */}
      <div className="ortu-cols-bottom">

        {/* kiri: riwayat presensi sekolah */}
        <div>
          <div className="section-block-head">
            <h2 className="section-block-title">Riwayat Presensi</h2>
            <span className="section-block-count">{s.presensi.length} pertemuan</span>
          </div>

          {s.presensi.length === 0 ? (
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
                {s.presensi.map(r => (
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

          {s.ekskulAnggota.length === 0 ? (
            <div className="card card-pad riwayat-empty">Tidak terdaftar di ekstrakulikuler.</div>
          ) : (
            <div className="card card-pad">
              <div className="ekskul-tag-row">
                {s.ekskulAnggota.map(ea => (
                  <span key={ea.ekskul.id} className="ekskul-tag">{ea.ekskul.nama}</span>
                ))}
              </div>

              {s.presensiEkskul.length > 0 && (
                <>
                  <div className="riwayat-sub-label">Riwayat Presensi Ekskul</div>
                  <div className="riwayat-list" style={{ margin: "0 -16px -16px" }}>
                    {s.presensiEkskul.map(pe => (
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
