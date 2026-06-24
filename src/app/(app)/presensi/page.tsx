import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddPresensiModalButton } from "@/components/AddPresensiModalButton";
import { DeletePresensiButton } from "@/components/DeletePresensiButton";
import { IconCalendar, IconUsers, IconX, IconWarn } from "@/components/icons";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = { IZIN: "Izin", SAKIT: "Sakit", ALPA: "Alpa" };
const STATUS_COLOR: Record<string, string> = {
  IZIN: "var(--warn)",
  SAKIT: "var(--info)",
  ALPA: "var(--bad)",
};

export default async function PresensiPage() {
  await requireStaff();

  const today = new Date().toISOString().slice(0, 10);

  const [siswa, rekapBulanIni] = await Promise.all([
    prisma.siswa.findMany({ select: { id: true, nama: true, kelas: true }, orderBy: { nama: "asc" } }),
    prisma.presensi.findMany({
      where: {
        tanggal: {
          gte: new Date(new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, "0") + "-01T00:00:00Z"),
        },
      },
      include: { siswa: { select: { nama: true, kelas: true } } },
      orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const totalHariIni = rekapBulanIni.filter(
    (p) => p.tanggal.toISOString().slice(0, 10) === today
  ).length;
  const totalAlpa = rekapBulanIni.filter((p) => p.status === "ALPA").length;
  const totalSakit = rekapBulanIni.filter((p) => p.status === "SAKIT").length;
  const totalIzin = rekapBulanIni.filter((p) => p.status === "IZIN").length;

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-head-left">
          <div className="eyebrow">Presensi</div>
          <h1 className="page-title">Kehadiran Siswa</h1>
        </div>
        <div className="page-actions">
          <AddPresensiModalButton students={siswa} today={today} />
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-icon stat-icon--blue"><IconCalendar /></div>
          <div className="stat-label">Hari Ini</div>
          <div className="stat-num">{totalHariIni}</div>
          <div className="stat-foot">siswa tidak hadir</div>
        </div>
        <div className="stat">
          <div className="stat-icon stat-icon--red"><IconX /></div>
          <div className="stat-label">Alpa</div>
          <div className="stat-num">{totalAlpa}</div>
          <div className="stat-foot">bulan ini</div>
        </div>
        <div className="stat">
          <div className="stat-icon stat-icon--green"><IconUsers /></div>
          <div className="stat-label">Sakit</div>
          <div className="stat-num">{totalSakit}</div>
          <div className="stat-foot">bulan ini</div>
        </div>
        <div className="stat">
          <div className="stat-icon stat-icon--amber"><IconWarn /></div>
          <div className="stat-label">Izin</div>
          <div className="stat-num">{totalIzin}</div>
          <div className="stat-foot">bulan ini</div>
        </div>
      </div>

      <div className="roster">
        <div className="presensi-head">
          <div>Siswa</div>
          <div>Tanggal</div>
          <div>Status</div>
          <div>Keterangan</div>
          <div>Dicatat oleh</div>
          <div />
        </div>
        {rekapBulanIni.length === 0 ? (
          <div className="empty">
            <IconUsers />
            <b>Belum ada catatan presensi</b>
            <p>Klik &ldquo;Catat Ketidakhadiran&rdquo; untuk menambahkan.</p>
          </div>
        ) : (
          rekapBulanIni.map((p) => (
            <div key={p.id} className="presensi-row">
              <div className="presensi-siswa">
                <b>{p.siswa.nama}</b>
                <span>{p.siswa.kelas}</span>
              </div>
              <div className="presensi-tanggal">
                {p.tanggal.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
              <div>
                <span className="absen-badge" style={{ background: STATUS_COLOR[p.status] + "22", color: STATUS_COLOR[p.status], border: `1px solid ${STATUS_COLOR[p.status]}44` }}>
                  {STATUS_LABEL[p.status]}
                </span>
              </div>
              <div className="presensi-ket">{p.keterangan || <span style={{ color: "var(--ink-faint)" }}>—</span>}</div>
              <div className="presensi-pencatat">{p.pencatatNama}</div>
              <div><DeletePresensiButton id={p.id} /></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
