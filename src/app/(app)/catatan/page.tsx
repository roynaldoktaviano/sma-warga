import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStaff, canInput, canViewTatib } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtTanggal } from "@/lib/format";
import { RecordModalButton } from "@/components/RecordModalButton";
import { Pagination } from "@/components/Pagination";
import { IconDown } from "@/components/icons";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const VERIF: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:  { label: "Menunggu", color: "var(--warn)",  bg: "var(--warn-bg)"  },
  VERIFIED: { label: "Terverif", color: "var(--good)",  bg: "var(--good-bg)"  },
  REJECTED: { label: "Ditolak",  color: "var(--bad)",   bg: "var(--bad-bg)"   },
};

export default async function CatatanPelanggaranPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const session = await requireStaff();
  const role = session.role ?? "";
  if (!canViewTatib(role)) redirect("/presensi");

  const totalCatatan = await prisma.catatan.count({ where: { jenis: "PELANGGARAN" } });
  const totalPages = Math.max(1, Math.ceil(totalCatatan / PAGE_SIZE));
  const page = Math.min(totalPages, Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1));

  const [siswa, catatan] = await Promise.all([
    prisma.siswa.findMany({
      where: { status: "AKTIF" },
      select: { id: true, nama: true, kelas: true, sekolahId: true },
      orderBy: { nama: "asc" },
    }),
    prisma.catatan.findMany({
      where: { jenis: "PELANGGARAN" },
      orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, poin: true, kategori: true, keterangan: true,
        tanggal: true, pencatatNama: true, statusVerif: true,
        siswa: { select: { id: true, nama: true, kelas: true } },
      },
    }),
  ]);

  const sekolahId = siswa[0]?.sekolahId ?? (await prisma.sekolah.findFirst())?.id;
  const [kategoriPelanggaran, kategoriPrestasi] = sekolahId
    ? await Promise.all([
        prisma.kategoriPelanggaran.findMany({ where: { sekolahId }, orderBy: { nama: "asc" }, select: { id: true, nama: true, poinMin: true, poinMax: true } }),
        prisma.kategoriPrestasi.findMany({ where: { sekolahId }, orderBy: { nama: "asc" }, select: { id: true, nama: true, poinMin: true, poinMax: true } }),
      ])
    : [[], []];

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <div className="eyebrow">Tata Tertib</div>
          <h1 className="page-title">Catatan Pelanggaran</h1>
        </div>
        <div className="page-actions">
          {canInput(role) && (
            <RecordModalButton
              students={siswa}
              kategoriPelanggaran={kategoriPelanggaran}
              kategoriPrestasi={kategoriPrestasi}
            />
          )}
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {catatan.length === 0 ? (
          <div className="empty">
            <IconDown />
            <b>Belum ada catatan pelanggaran</b>
            <p>Klik &ldquo;Catat Kejadian&rdquo; untuk menambahkan.</p>
          </div>
        ) : (
          <>
            <div className="catatan-feed-head">
              <span>Siswa &amp; Kategori</span>
              <span>Tanggal</span>
              <span>Poin</span>
              <span>Pencatat</span>
              <span>Status</span>
            </div>
            {catatan.map(c => {
              const verif = VERIF[c.statusVerif] ?? VERIF.PENDING;
              return (
                <Link key={c.id} href={`/siswa/${c.siswa.id}`} className="catatan-feed-row">
                  <div className="catatan-feed-cell-siswa">
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{c.siswa.nama}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                      {c.siswa.kelas} · {c.kategori}
                    </div>
                  </div>
                  <div className="catatan-feed-cell-tanggal">{fmtTanggal(c.tanggal)}</div>
                  <div className="catatan-feed-cell-poin">
                    −{Math.abs(c.poin)}
                  </div>
                  <div className="catatan-feed-cell-pencatat">{c.pencatatNama}</div>
                  <span
                    className="catatan-feed-cell-status"
                    style={{ background: verif.bg, color: verif.color }}
                  >
                    {verif.label}
                  </span>
                </Link>
              );
            })}
          </>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} total={totalCatatan} noun="catatan" />
    </div>
  );
}
