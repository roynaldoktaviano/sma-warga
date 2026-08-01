import Link from "next/link";
import { requireStaff, canInput } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentPoints, statusOf } from "@/lib/points";
import { daysSince, fmtTanggal } from "@/lib/format";
import { RecordModalButton } from "@/components/RecordModalButton";
import { IconGauge, IconWarn, IconDown, IconUp } from "@/components/icons";

export const dynamic = "force-dynamic";

const VERIF_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:  { label: "Menunggu", color: "var(--warn)",  bg: "var(--warn-bg)"  },
  VERIFIED: { label: "Terverif", color: "var(--good)",  bg: "var(--good-bg)"  },
  REJECTED: { label: "Ditolak",  color: "var(--bad)",   bg: "var(--bad-bg)"   },
};

export default async function TatibPage() {
  const session = await requireStaff();
  const role = session.role ?? "";

  const [siswa, recentCatatan] = await Promise.all([
    prisma.siswa.findMany({
      where: { status: "AKTIF" },
      include: { catatan: { select: { poin: true, statusVerif: true } } },
    }),
    prisma.catatan.findMany({
      orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
      take: 40,
      select: {
        id: true, poin: true, jenis: true, kategori: true, keterangan: true,
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

  const total   = siswa.length;
  const points  = siswa.map(s => currentPoints(s.poinAwal, s.catatan));
  const rata    = total ? Math.round(points.reduce((a, p) => a + p, 0) / total) : 0;
  const perhatian = siswa.filter((s, i) => {
    const k = statusOf(points[i]).key;
    return k === "perhatian" || k === "pembinaan";
  }).length;
  let weekPel = 0, weekPres = 0;
  recentCatatan.forEach(c => {
    if (daysSince(c.tanggal) <= 7) {
      if (c.jenis === "PELANGGARAN") weekPel++;
      else weekPres++;
    }
  });

  const studentOpts = siswa.map(s => ({ id: s.id, nama: s.nama, kelas: s.kelas }));

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <div className="eyebrow">Tata Tertib</div>
          <h1 className="page-title">Dasbor Tatib</h1>
        </div>
        <div className="page-actions">
          {canInput(role) && (
            <RecordModalButton
              students={studentOpts}
              kategoriPelanggaran={kategoriPelanggaran}
              kategoriPrestasi={kategoriPrestasi}
            />
          )}
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-icon stat-icon--green"><IconGauge /></div>
          <div className="stat-label">Rata-rata Poin</div>
          <div className="stat-num">{rata}</div>
          <div className="stat-foot">{statusOf(rata).label} secara umum</div>
        </div>
        <div className="stat">
          <div className="stat-icon stat-icon--amber"><IconWarn /></div>
          <div className="stat-label">Perlu Perhatian</div>
          <div className="stat-num">{perhatian}</div>
          <div className="stat-foot">di bawah poin baik</div>
        </div>
        <div className="stat">
          <div className="stat-icon stat-icon--red"><IconDown /></div>
          <div className="stat-label">Pelanggaran Pekan Ini</div>
          <div className="stat-num">{weekPel}</div>
          <div className="stat-foot">7 hari terakhir</div>
        </div>
        <div className="stat">
          <div className="stat-icon stat-icon--purple"><IconUp /></div>
          <div className="stat-label">Prestasi Pekan Ini</div>
          <div className="stat-num">{weekPres}</div>
          <div className="stat-foot">7 hari terakhir</div>
        </div>
      </div>

      {/* Catatan feed */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>
          Catatan Terbaru
        </div>
        <div className="card" style={{ overflow: "hidden" }}>
          {recentCatatan.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "var(--ink-faint)" }}>
              Belum ada catatan. Klik "Catat Kejadian" untuk mulai.
            </div>
          ) : (
            <>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 140px 80px 90px 90px",
                padding: "8px 16px",
                background: "var(--surface-2)",
                borderBottom: "1px solid var(--line)",
                fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: ".05em", color: "var(--ink-faint)",
              }}>
                <span>Siswa &amp; Kategori</span>
                <span>Tanggal</span>
                <span>Poin</span>
                <span>Jenis</span>
                <span>Status</span>
              </div>
              {recentCatatan.map(c => {
                const isPel = c.jenis === "PELANGGARAN";
                const verif = VERIF_LABEL[c.statusVerif] ?? VERIF_LABEL.PENDING;
                return (
                  <Link
                    key={c.id}
                    href={`/siswa/${c.siswa.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 140px 80px 90px 90px",
                      padding: "10px 16px",
                      borderBottom: "1px solid var(--line-soft)",
                      alignItems: "center",
                      transition: "background .1s",
                    }}
                      className="tatib-row"
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{c.siswa.nama}</div>
                        <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                          {c.siswa.kelas} · {c.kategori}
                        </div>
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                        {fmtTanggal(c.tanggal)}
                      </div>
                      <div style={{
                        fontSize: 13, fontFamily: "var(--mono)", fontWeight: 700,
                        color: isPel ? "var(--bad)" : "var(--good)",
                      }}>
                        {isPel ? "−" : "+"}{Math.abs(c.poin)}
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                        background: isPel ? "var(--bad-bg)" : "var(--good-bg)",
                        color: isPel ? "var(--bad)" : "var(--good)",
                        width: "fit-content",
                      }}>
                        {isPel ? "Pelanggaran" : "Prestasi"}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                        background: verif.bg, color: verif.color,
                        width: "fit-content",
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
    </div>
  );
}
