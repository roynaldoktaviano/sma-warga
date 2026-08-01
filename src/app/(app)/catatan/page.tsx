import Link from "next/link";
import { requireStaff, canInput } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtTanggal } from "@/lib/format";
import { RecordModalButton } from "@/components/RecordModalButton";
import { IconDown } from "@/components/icons";

export const dynamic = "force-dynamic";

const VERIF: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:  { label: "Menunggu", color: "var(--warn)",  bg: "var(--warn-bg)"  },
  VERIFIED: { label: "Terverif", color: "var(--good)",  bg: "var(--good-bg)"  },
  REJECTED: { label: "Ditolak",  color: "var(--bad)",   bg: "var(--bad-bg)"   },
};

export default async function CatatanPelanggaranPage() {
  const session = await requireStaff();
  const role = session.role ?? "";

  const [siswa, catatan] = await Promise.all([
    prisma.siswa.findMany({
      where: { status: "AKTIF" },
      select: { id: true, nama: true, kelas: true, sekolahId: true },
      orderBy: { nama: "asc" },
    }),
    prisma.catatan.findMany({
      where: { jenis: "PELANGGARAN" },
      orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
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
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 140px 70px 110px 90px",
              padding: "8px 16px",
              background: "var(--surface-2)",
              borderBottom: "1px solid var(--line)",
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: ".05em", color: "var(--ink-faint)",
            }}>
              <span>Siswa &amp; Kategori</span>
              <span>Tanggal</span>
              <span>Poin</span>
              <span>Pencatat</span>
              <span>Status</span>
            </div>
            {catatan.map(c => {
              const verif = VERIF[c.statusVerif] ?? VERIF.PENDING;
              return (
                <Link key={c.id} href={`/siswa/${c.siswa.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="tatib-row" style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 140px 70px 110px 90px",
                    padding: "10px 16px",
                    borderBottom: "1px solid var(--line-soft)",
                    alignItems: "center",
                    transition: "background .1s",
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{c.siswa.nama}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                        {c.siswa.kelas} · {c.kategori}
                      </div>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{fmtTanggal(c.tanggal)}</div>
                    <div style={{ fontSize: 13, fontFamily: "var(--mono)", fontWeight: 700, color: "var(--bad)" }}>
                      −{Math.abs(c.poin)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{c.pencatatNama}</div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                      background: verif.bg, color: verif.color, width: "fit-content",
                    }}>
                      {verif.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
