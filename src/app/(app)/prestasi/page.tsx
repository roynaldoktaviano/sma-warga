import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddPrestasiModalButton } from "@/components/AddPrestasiModalButton";
import { DeletePrestasiButton } from "@/components/DeletePrestasiButton";
import { IconTrophy, IconUp, IconGauge } from "@/components/icons";

export const dynamic = "force-dynamic";

const TINGKAT_LABEL: Record<string, string> = {
  SEKOLAH: "Sekolah",
  KOTA: "Kota",
  PROVINSI: "Provinsi",
  NASIONAL: "Nasional",
  INTERNASIONAL: "Internasional",
};
const TINGKAT_COLOR: Record<string, string> = {
  SEKOLAH: "#64748b",
  KOTA: "var(--accent)",
  PROVINSI: "var(--good)",
  NASIONAL: "var(--warn)",
  INTERNASIONAL: "#9333ea",
};

export default async function PrestasiPage() {
  await requireStaff();

  const [siswa, semua] = await Promise.all([
    prisma.siswa.findMany({ select: { id: true, nama: true, kelas: true }, orderBy: { nama: "asc" } }),
    prisma.prestasi.findMany({
      include: { siswa: { select: { nama: true, kelas: true } } },
      orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const totalNasional = semua.filter((p) => p.tingkat === "NASIONAL" || p.tingkat === "INTERNASIONAL").length;
  const totalProvinsi = semua.filter((p) => p.tingkat === "PROVINSI").length;
  const totalKota = semua.filter((p) => p.tingkat === "KOTA").length;

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-head-left">
          <div className="eyebrow">Prestasi</div>
          <h1 className="page-title">Rekap Prestasi Siswa</h1>
        </div>
        <div className="page-actions">
          <AddPrestasiModalButton students={siswa} />
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-icon stat-icon--amber"><IconTrophy /></div>
          <div className="stat-label">Total Prestasi</div>
          <div className="stat-num">{semua.length}</div>
          <div className="stat-foot">tercatat di sistem</div>
        </div>
        <div className="stat">
          <div className="stat-icon stat-icon--purple"><IconUp /></div>
          <div className="stat-label">Nasional / Internasional</div>
          <div className="stat-num">{totalNasional}</div>
          <div className="stat-foot">pencapaian tertinggi</div>
        </div>
        <div className="stat">
          <div className="stat-icon stat-icon--green"><IconGauge /></div>
          <div className="stat-label">Provinsi</div>
          <div className="stat-num">{totalProvinsi}</div>
          <div className="stat-foot">tingkat provinsi</div>
        </div>
        <div className="stat">
          <div className="stat-icon stat-icon--blue"><IconTrophy /></div>
          <div className="stat-label">Kota</div>
          <div className="stat-num">{totalKota}</div>
          <div className="stat-foot">tingkat kota</div>
        </div>
      </div>

      <div className="roster">
        <div className="prestasi-head">
          <div>Siswa</div>
          <div>Prestasi</div>
          <div>Tingkat</div>
          <div>Peringkat</div>
          <div>Tanggal</div>
          <div />
        </div>
        {semua.length === 0 ? (
          <div className="empty">
            <IconTrophy />
            <b>Belum ada prestasi tercatat</b>
            <p>Klik &ldquo;Tambah Prestasi&rdquo; untuk menambahkan.</p>
          </div>
        ) : (
          semua.map((p) => (
            <div key={p.id} className="prestasi-row">
              <div className="presensi-siswa">
                <b>{p.siswa.nama}</b>
                <span>{p.siswa.kelas}</span>
              </div>
              <div className="prestasi-judul">
                <b>{p.judul}</b>
                <span>{p.kategori}</span>
              </div>
              <div>
                <span className="tingkat-badge" style={{ background: TINGKAT_COLOR[p.tingkat] + "20", color: TINGKAT_COLOR[p.tingkat], border: `1px solid ${TINGKAT_COLOR[p.tingkat]}44` }}>
                  {TINGKAT_LABEL[p.tingkat]}
                </span>
              </div>
              <div className="presensi-ket">{p.peringkat || <span style={{ color: "var(--ink-faint)" }}>—</span>}</div>
              <div className="presensi-tanggal">
                {p.tanggal.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
              <div><DeletePrestasiButton id={p.id} /></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
