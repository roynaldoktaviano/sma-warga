import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtTanggal } from "@/lib/format";
import { DeletePresensiButton } from "@/components/DeletePresensiButton";
import { PresensiKelasButton } from "@/components/PresensiKelasButton";
import { ExportPresensiButton } from "@/components/ExportPresensiButton";
import { PresensiDatePicker } from "@/components/PresensiDatePicker";
import { RiwayatHarianModalButton } from "@/components/RiwayatHarianModalButton";
import { IconCalendar, IconUsers, IconX, IconWarn } from "@/components/icons";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = { HADIR: "Hadir", IZIN: "Izin", SAKIT: "Sakit", ALPA: "Alpa" };
// Sama dengan skema warna .absen-pill--* (globals.css) — supaya konsisten & ikut dark mode.
const STATUS_BG: Record<string, string>    = { HADIR: "var(--good-bg)", IZIN: "var(--info-bg)", SAKIT: "var(--warn-bg)", ALPA: "var(--bad-bg)" };
const STATUS_COLOR: Record<string, string> = { HADIR: "var(--good)", IZIN: "var(--info)", SAKIT: "var(--warn)", ALPA: "var(--bad)" };

export default async function PresensiPage({
  searchParams,
}: {
  searchParams?: { tanggal?: string };
}) {
  await requireStaff();

  const today = new Date().toISOString().slice(0, 10);
  const todayDate = new Date(today + "T00:00:00Z");

  const tanggalHarian = /^\d{4}-\d{2}-\d{2}$/.test(searchParams?.tanggal ?? "") ? searchParams!.tanggal! : today;
  const tanggalHarianDate = new Date(tanggalHarian + "T00:00:00Z");

  const bulanAwal = new Date(
    new Date().getFullYear() + "-" +
    String(new Date().getMonth() + 1).padStart(2, "0") + "-01T00:00:00Z"
  );

  const [semuaSiswa, presensiHariIni, presensiBulanIni, kelasSudahDiabsen, presensiHarian] = await Promise.all([
    prisma.siswa.findMany({
      where: { status: "AKTIF" },
      orderBy: [{ kelas: "asc" }, { nama: "asc" }],
      select: { id: true, nama: true, kelas: true, nisn: true },
    }),
    prisma.presensi.findMany({
      where: { tanggal: todayDate },
      select: { siswaId: true, status: true },
    }),
    prisma.presensi.findMany({
      where: { tanggal: { gte: bulanAwal } },
      include: { siswa: { select: { nama: true, kelas: true } } },
      orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
    }),
    prisma.presensiKelasLog.findMany({
      where: { tanggal: todayDate },
      select: { kelas: true, pencatatNama: true },
    }),
    tanggalHarian === today
      ? Promise.resolve(null) // sudah ada di presensiHariIni, tidak perlu query ulang
      : prisma.presensi.findMany({
          where: { tanggal: tanggalHarianDate },
          select: { siswaId: true, status: true },
        }),
  ]);

  const diabsenMap = new Map(kelasSudahDiabsen.map(l => [l.kelas, l.pencatatNama]));
  const harianMap: Record<string, string> = {};
  for (const p of presensiHarian ?? presensiHariIni) harianMap[p.siswaId] = p.status;

  // Kelompokkan siswa per kelas
  const kelasList = new Map<string, typeof semuaSiswa>();
  for (const s of semuaSiswa) {
    if (!kelasList.has(s.kelas)) kelasList.set(s.kelas, []);
    kelasList.get(s.kelas)!.push(s);
  }
  // Urutkan kelas
  const kelasArr = Array.from(kelasList.entries()).sort(([a], [b]) => a.localeCompare(b));

  // Map presensi hari ini per siswa
  const hariIniMap: Record<string, string> = {};
  for (const p of presensiHariIni) hariIniMap[p.siswaId] = p.status;

  // Stats
  const tidakHadirHariIni = presensiHariIni.length;
  const alpa  = presensiBulanIni.filter(p => p.status === "ALPA").length;
  const sakit = presensiBulanIni.filter(p => p.status === "SAKIT").length;
  const izin  = presensiBulanIni.filter(p => p.status === "IZIN").length;

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <div className="eyebrow">Presensi</div>
          <h1 className="page-title">Kehadiran Siswa</h1>
        </div>
        <div className="page-actions">
          <ExportPresensiButton />
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat">
          <div className="stat-icon stat-icon--blue"><IconCalendar /></div>
          <div className="stat-label">Tidak Hadir Hari Ini</div>
          <div className="stat-num">{tidakHadirHariIni}</div>
          <div className="stat-foot">dari {semuaSiswa.length} siswa aktif</div>
        </div>
        <div className="stat">
          <div className="stat-icon stat-icon--red"><IconX /></div>
          <div className="stat-label">Alpa</div>
          <div className="stat-num">{alpa}</div>
          <div className="stat-foot">bulan ini</div>
        </div>
        <div className="stat">
          <div className="stat-icon stat-icon--green"><IconUsers /></div>
          <div className="stat-label">Sakit</div>
          <div className="stat-num">{sakit}</div>
          <div className="stat-foot">bulan ini</div>
        </div>
        <div className="stat">
          <div className="stat-icon stat-icon--amber"><IconWarn /></div>
          <div className="stat-label">Izin</div>
          <div className="stat-num">{izin}</div>
          <div className="stat-foot">bulan ini</div>
        </div>
      </div>

      {/* Daftar Kelas */}
      <div style={{ marginBottom: 8 }}>
        <div className="section-label">Pilih Kelas untuk Input Presensi</div>
      </div>
      <div className="kelas-grid">
        {kelasArr.map(([kelas, siswa]) => {
          const tidakHadir = siswa.filter(s => hariIniMap[s.id]).length;
          const hadir = siswa.length - tidakHadir;
          const pct = Math.round((hadir / siswa.length) * 100);
          const sudahDiabsen = diabsenMap.get(kelas);
          return (
            <div key={kelas} className="kelas-card">
              <div className="kelas-card-top">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="kelas-card-name">{kelas}</div>
                    {sudahDiabsen ? (
                      <span title={`Diabsen oleh ${sudahDiabsen}`} style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                        background: "var(--good-bg)", color: "var(--good)",
                      }}>
                        ✓ Sudah diabsen
                      </span>
                    ) : (
                      <span style={{
                        fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                        background: "var(--line-soft)", color: "var(--ink-faint)",
                      }}>
                        Belum diabsen
                      </span>
                    )}
                  </div>
                  <div className="kelas-card-count">{siswa.length} siswa</div>
                </div>
                <PresensiKelasButton
                  kelas={kelas}
                  siswa={siswa.map(s => ({ id: s.id, nama: s.nama }))}
                  existing={Object.fromEntries(
                    siswa.map(s => [s.id, (hariIniMap[s.id] ?? "HADIR") as "HADIR" | "IZIN" | "SAKIT" | "ALPA"])
                  )}
                />
              </div>
              {/* Progress bar kehadiran hari ini */}
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-faint)", marginBottom: 4 }}>
                  <span>Kehadiran hari ini</span>
                  <span>{hadir}/{siswa.length} ({pct}%)</span>
                </div>
                <div style={{ height: 5, borderRadius: 10, background: "var(--line-soft)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 10, transition: "width .3s",
                    width: pct + "%",
                    background: pct === 100 ? "var(--good)" : pct >= 80 ? "var(--accent)" : "var(--warn)",
                  }} />
                </div>
                {tidakHadir > 0 && (
                  <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {siswa.filter(s => hariIniMap[s.id]).map(s => (
                      <span key={s.id} style={{
                        fontSize: 11, padding: "2px 7px", borderRadius: 20,
                        background: STATUS_BG[hariIniMap[s.id]] ?? "#f5f5f5",
                        color: STATUS_COLOR[hariIniMap[s.id]] ?? "var(--ink-faint)",
                      }}>
                        {s.nama.split(" ")[0]} · {STATUS_LABEL[hariIniMap[s.id]] ?? hariIniMap[s.id]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Riwayat Harian — status semua siswa di tanggal tertentu */}
      <div style={{ marginTop: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div className="section-label">Riwayat Harian</div>
          <PresensiDatePicker value={tanggalHarian} />
        </div>
        <p style={{ fontSize: 12.5, color: "var(--ink-faint)", margin: "4px 0 12px" }}>
          Status seluruh siswa pada {fmtTanggal(tanggalHarianDate)} — {semuaSiswa.length - Object.keys(harianMap).length} hadir,{" "}
          {Object.keys(harianMap).length} tidak hadir.
        </p>
        <div className="kelas-grid">
          {kelasArr.map(([kelas, siswa]) => (
            <RiwayatHarianModalButton
              key={kelas}
              kelas={kelas}
              siswa={siswa.map(s => ({
                id: s.id, nama: s.nama, nisn: s.nisn,
                status: (harianMap[s.id] ?? "HADIR") as "HADIR" | "IZIN" | "SAKIT" | "ALPA",
              }))}
            />
          ))}
        </div>
      </div>

      {/* Riwayat absensi bulan ini */}
      <div style={{ marginTop: 28 }}>
        <div className="section-label">Riwayat Absensi Bulan Ini</div>
        <div className="card" style={{ overflow: "hidden", marginTop: 8 }}>
          {presensiBulanIni.length === 0 ? (
            <div style={{ padding: "28px 20px", textAlign: "center", color: "var(--ink-faint)", fontSize: 13 }}>
              Belum ada catatan absensi bulan ini.
            </div>
          ) : (
            <>
              <div className="presensi-head">
                <div>Siswa</div>
                <div>Tanggal</div>
                <div>Status</div>
                <div>Dicatat oleh</div>
                <div />
              </div>
              {presensiBulanIni.map(p => (
                <div key={p.id} className="presensi-row">
                  <div className="presensi-siswa">
                    <b>{p.siswa.nama}</b>
                    <span>{p.siswa.kelas}</span>
                  </div>
                  <div className="presensi-tanggal">{fmtTanggal(p.tanggal)}</div>
                  <div>
                    <span className="absen-badge" style={{
                      background: STATUS_BG[p.status],
                      color: STATUS_COLOR[p.status],
                    }}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </div>
                  <div className="presensi-pencatat">{p.pencatatNama}</div>
                  <div><DeletePresensiButton id={p.id} /></div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
