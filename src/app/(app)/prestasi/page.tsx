import { redirect } from "next/navigation";
import { requireStaff, canViewTatib } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddPrestasiModalButton } from "@/components/AddPrestasiModalButton";
import { DeletePrestasiButton } from "@/components/DeletePrestasiButton";
import { Pagination } from "@/components/Pagination";
import { IconTrophy, IconUp, IconGauge } from "@/components/icons";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const TINGKAT_LABEL: Record<string, string> = {
  SEKOLAH: "Sekolah",
  KOTA: "Kota",
  PROVINSI: "Provinsi",
  NASIONAL: "Nasional",
  INTERNASIONAL: "Internasional",
};
// Kelas warna (lihat .tingkat-badge--* di globals.css) — pakai class, bukan
// inline style, supaya varian dark-mode-nya bisa ikut aktif otomatis.
const TINGKAT_CLASS: Record<string, string> = {
  SEKOLAH: "tingkat-badge--sekolah",
  KOTA: "tingkat-badge--kota",
  PROVINSI: "tingkat-badge--provinsi",
  NASIONAL: "tingkat-badge--nasional",
  INTERNASIONAL: "tingkat-badge--internasional",
};

export default async function PrestasiPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const session = await requireStaff();
  if (!canViewTatib(session.role)) redirect("/presensi");

  const totalPrestasi = await prisma.prestasi.count();
  const totalPages = Math.max(1, Math.ceil(totalPrestasi / PAGE_SIZE));
  const page = Math.min(totalPages, Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1));

  const [siswa, semua, perTingkat] = await Promise.all([
    prisma.siswa.findMany({ select: { id: true, nama: true, kelas: true }, orderBy: { nama: "asc" } }),
    prisma.prestasi.findMany({
      include: { siswa: { select: { nama: true, kelas: true } } },
      orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.prestasi.groupBy({ by: ["tingkat"], _count: { _all: true } }),
  ]);

  const countOf = (t: string) => perTingkat.find((g) => g.tingkat === t)?._count._all ?? 0;
  const totalNasional = countOf("NASIONAL") + countOf("INTERNASIONAL");
  const totalProvinsi = countOf("PROVINSI");
  const totalKota = countOf("KOTA");

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
          <div className="stat-num">{totalPrestasi}</div>
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
                <span className={"tingkat-badge " + (TINGKAT_CLASS[p.tingkat] ?? "")}>
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

      <Pagination page={page} totalPages={totalPages} total={totalPrestasi} noun="prestasi" />
    </div>
  );
}
