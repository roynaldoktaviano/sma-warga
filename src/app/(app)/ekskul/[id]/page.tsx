import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireStaff, canManage, canVerify } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtTanggal } from "@/lib/format";
import { IconBack } from "@/components/icons";
import { ManageEkskulGuruButton } from "@/components/ManageEkskulGuruButton";
import { ManageEkskulAnggotaButton } from "@/components/ManageEkskulAnggotaButton";
import { PresensiEkskulButton } from "@/components/PresensiEkskulButton";
import { RemoveEkskulAnggotaButton } from "@/components/RemoveEkskulAnggotaButton";

export const dynamic = "force-dynamic";

const STATUS_ABSEN: Record<string, string> = {
  HADIR: "Hadir", IZIN: "Izin", SAKIT: "Sakit", ALPA: "Alpa",
};

export default async function EkskulDetailPage({ params }: { params: { id: string } }) {
  const session = await requireStaff();

  const isAdmin   = canVerify(session.role);  // KESISWAAN + KEPSEK
  const isManager = canManage(session.role);  // KESISWAAN saja

  const ekskul = await prisma.ekskul.findUnique({
    where: { id: params.id },
    include: {
      tahunAjaran: true,
      guru: { include: { staff: { select: { id: true, nama: true } } } },
      anggota: {
        include: { siswa: { select: { id: true, nama: true, nis: true, kelas: true } } },
        orderBy: { siswa: { nama: "asc" } },
      },
      presensi: {
        orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
        include: { siswa: { select: { nama: true, kelas: true } } },
        distinct: ["tanggal"],
      },
    },
  });

  if (!ekskul) notFound();

  // Guru (GURU / GURU_EKSKUL) hanya bisa masuk kalau terdaftar sebagai pembina di ekskul ini
  const isPembina = !isAdmin && ekskul.guru.some(g => g.staffId === session.sub);
  if (!isAdmin && !isPembina) redirect("/ekskul");

  // Get all presensi grouped by tanggal
  const allPresensi = await prisma.presensiEkskul.findMany({
    where: { ekskulId: ekskul.id },
    orderBy: { tanggal: "desc" },
    include: { siswa: { select: { nama: true, kelas: true } } },
  });

  // Group presensi by date string
  const byDate = new Map<string, typeof allPresensi>();
  for (const p of allPresensi) {
    const k = p.tanggal.toISOString().slice(0, 10);
    if (!byDate.has(k)) byDate.set(k, []);
    byDate.get(k)!.push(p);
  }

  const ta = ekskul.tahunAjaran;
  const canInput = ta.status === "BERJALAN" && (isManager || isPembina);
  const locked = ta.status === "SELESAI";

  // Staff list for assigning guru
  const allStaff = isManager
    ? await prisma.staff.findMany({
        where: { sekolahId: ta.sekolahId },
        orderBy: { nama: "asc" },
        select: { id: true, nama: true, role: true },
      })
    : [];

  // Siswa not yet in this ekskul (for adding anggota)
  const anggotaIds = ekskul.anggota.map(a => a.siswaId);
  const availableSiswa = (isManager && !locked)
    ? await prisma.siswa.findMany({
        where: { sekolahId: ta.sekolahId, status: "AKTIF", id: { notIn: anggotaIds } },
        orderBy: [{ kelas: "asc" }, { nama: "asc" }],
        select: { id: true, nama: true, nis: true, kelas: true },
      })
    : [];

  return (
    <div className="shell">
      <Link href="/ekskul" className="btn btn-ghost btn-sm" style={{ marginBottom: 16, textDecoration: "none" }}>
        <IconBack /> Kembali
      </Link>

      <div className="page-head" style={{ marginBottom: 20 }}>
        <div>
          <div className="eyebrow">Ekskul</div>
          <h1 className="page-title">{ekskul.nama}</h1>
          {ekskul.deskripsi && <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>{ekskul.deskripsi}</p>}
        </div>
        <span className={"ta-status ta-status--" + ta.status.toLowerCase()}>
          {ta.nama} · {ta.status}
        </span>
      </div>

      <div className="detail-grid">
        {/* Left column: info + guru + anggota */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Guru Pembina */}
          <div className="card card-pad">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Guru Pembina</div>
              {isManager && !locked && (
                <ManageEkskulGuruButton
                  ekskulId={ekskul.id}
                  currentGuru={ekskul.guru.map(g => ({ id: g.staffId, nama: g.staff.nama }))}
                  allStaff={allStaff}
                />
              )}
            </div>
            {ekskul.guru.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>Belum ada guru pembina.</div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {ekskul.guru.map(g => (
                  <li key={g.id} style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 28, height: 28, borderRadius: "50%", background: "var(--accent)",
                        color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600, flex: "none",
                      }}
                    >
                      {g.staff.nama.charAt(0).toUpperCase()}
                    </div>
                    {g.staff.nama}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Anggota */}
          <div className="card card-pad">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                Anggota <span style={{ fontWeight: 400, color: "var(--ink-faint)", fontSize: 13 }}>({ekskul.anggota.length})</span>
              </div>
              {isManager && !locked && availableSiswa.length > 0 && (
                <ManageEkskulAnggotaButton ekskulId={ekskul.id} availableSiswa={availableSiswa} />
              )}
            </div>
            {ekskul.anggota.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>Belum ada anggota.</div>
            ) : (
              <div className="ekskul-anggota-list">
                {ekskul.anggota.map(a => (
                  <div key={a.id} className="ekskul-anggota-row">
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{a.siswa.nama}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>{a.siswa.kelas} · {a.siswa.nis}</div>
                    </div>
                    {isManager && !locked && (
                      <RemoveEkskulAnggotaButton ekskulId={ekskul.id} siswaId={a.siswaId} namaSiswa={a.siswa.nama} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: presensi */}
        <div className="card card-pad">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Presensi</div>
            {canInput && ekskul.anggota.length > 0 && (
              <PresensiEkskulButton
                ekskulId={ekskul.id}
                anggota={ekskul.anggota.map(a => ({ id: a.siswaId, nama: a.siswa.nama, kelas: a.siswa.kelas }))}
                isGuruEkskul={isPembina}
              />
            )}
          </div>
          {byDate.size === 0 ? (
            <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>
              {ta.status === "BERJALAN" ? "Belum ada presensi. Klik ＋ untuk input." : "Belum ada presensi."}
            </div>
          ) : (
            Array.from(byDate.entries()).map(([dateStr, records]) => {
              const hadir  = records.filter(r => r.status === "HADIR").length;
              const total  = records.length;
              return (
                <div key={dateStr} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{fmtTanggal(new Date(dateStr + "T00:00:00Z"))}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{hadir}/{total} hadir</div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {records.map(r => (
                      <span
                        key={r.id}
                        style={{
                          fontSize: 11.5, padding: "2px 8px", borderRadius: 20,
                          background: r.status === "HADIR" ? "var(--good-bg)" : "var(--warn-bg)",
                          color: r.status === "HADIR" ? "var(--good)" : "var(--warn)",
                        }}
                        title={`${r.siswa.nama} — ${STATUS_ABSEN[r.status] ?? r.status}`}
                      >
                        {r.siswa.nama.split(" ")[0]} · {STATUS_ABSEN[r.status] ?? r.status}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
