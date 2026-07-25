import { requireStaff, canManage, canViewTatib } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AddKelasButton } from "@/components/AddKelasButton";
import { DeleteKelasButton } from "@/components/DeleteKelasButton";
import { SetWaliKelasButton } from "@/components/SetWaliKelasButton";
import { ManageKelasAnggotaButton } from "@/components/ManageKelasAnggotaButton";
import { IconGrid, IconUsers, IconFlag, IconLock } from "@/components/icons";

export const dynamic = "force-dynamic";

function semLabel(s: string) { return s === "GANJIL" ? "Ganjil" : "Genap"; }

export default async function KelasPage({ searchParams }: { searchParams: { ta?: string } }) {
  const session = await requireStaff();
  if (!canViewTatib(session.role)) redirect("/dashboard");

  const isManager = canManage(session.role);

  // Semua tahun ajaran untuk selector
  const allTa = await prisma.tahunAjaran.findMany({
    orderBy: [{ isActive: "desc" }, { nama: "desc" }, { semester: "asc" }],
    select: { id: true, nama: true, semester: true, isActive: true, status: true },
  });

  if (allTa.length === 0) {
    return (
      <div className="shell">
        <div className="page-head">
          <div>
            <div className="eyebrow">Akademik</div>
            <h1 className="page-title">Kelas</h1>
          </div>
        </div>
        <div className="empty">
          <IconFlag />
          <b>Belum ada tahun ajaran</b>
          <p>
            {isManager
              ? <><Link href="/tahun-ajaran" style={{ color: "var(--accent)" }}>Tambah tahun ajaran</Link> terlebih dahulu.</>
              : "Hubungi Waka Kesiswaan untuk mengatur tahun ajaran."}
          </p>
        </div>
      </div>
    );
  }

  // Pilih TA yang ditampilkan: dari query param, atau aktif, atau pertama
  const selectedId = allTa.find(t => t.id === searchParams.ta)?.id
    ?? allTa.find(t => t.isActive)?.id
    ?? allTa[0].id;

  const selectedTa = await prisma.tahunAjaran.findUnique({
    where: { id: selectedId },
    include: {
      kelas: {
        orderBy: { nama: "asc" },
        include: {
          waliKelas: { select: { id: true, nama: true } },
          anggota: {
            include: { siswa: { select: { id: true, nama: true, nis: true, kelas: true } } },
            orderBy: { siswa: { nama: "asc" } },
          },
        },
      },
    },
  });

  if (!selectedTa) redirect("/kelas");

  const locked = selectedTa.isActive;

  // Staff untuk pilih wali kelas (hanya jika manager dan tidak terkunci)
  const allStaff = isManager && !locked
    ? await prisma.staff.findMany({
        orderBy: { nama: "asc" },
        select: { id: true, nama: true, role: true },
      })
    : [];

  // Siswa aktif yang belum di kelas manapun di TA ini
  const anggotaIds = selectedTa.kelas.flatMap(k => k.anggota.map(a => a.siswaId));
  const availableSiswa = isManager && !locked
    ? await prisma.siswa.findMany({
        where: { status: "AKTIF", id: { notIn: anggotaIds } },
        orderBy: [{ kelas: "asc" }, { nama: "asc" }],
        select: { id: true, nama: true, nis: true, kelas: true },
      })
    : [];

  const taLabel = `${selectedTa.nama} ${semLabel(selectedTa.semester)}`;

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <div className="eyebrow">Akademik</div>
          <h1 className="page-title">Kelas</h1>
        </div>
        <div className="page-actions">
          {isManager && !locked && (
            <AddKelasButton tahunAjaranId={selectedTa.id} allStaff={allStaff} />
          )}
        </div>
      </div>

      {/* TA Selector */}
      <div className="ta-selector">
        {allTa.map(ta => (
          <Link
            key={ta.id}
            href={`/kelas?ta=${ta.id}`}
            className={"ta-selector-btn" + (ta.id === selectedId ? " ta-selector-btn--active" : "")}
          >
            <span>{ta.nama}</span>
            <span className={"ta-sem-chip ta-sem-chip--" + ta.semester.toLowerCase()}>
              {semLabel(ta.semester)}
            </span>
            {ta.isActive && <span className="ta-active-dot" />}
          </Link>
        ))}
      </div>

      {/* Lock notice */}
      {locked && (
        <div className="kelas-lock-notice">
          <IconLock style={{ width: 14, height: 14, flexShrink: 0 }} />
          <span>Tahun ajaran <b>{taLabel}</b> sedang aktif — pengaturan kelas terkunci.</span>
        </div>
      )}

      {selectedTa.kelas.length === 0 ? (
        <div className="empty">
          <IconGrid />
          <b>Belum ada kelas</b>
          <p>
            {locked
              ? `Tidak ada kelas di tahun ajaran ${taLabel}.`
              : isManager
                ? `Tambah kelas untuk tahun ajaran ${taLabel}.`
                : `Belum ada kelas yang dibuat untuk tahun ajaran ${taLabel}.`}
          </p>
        </div>
      ) : (
        <div className="kelas-grid">
          {selectedTa.kelas.map((kelas) => (
            <div key={kelas.id} className="card kelas-card-full">
              {/* Header kelas */}
              <div className="kelas-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="kelas-badge">
                    <IconGrid />
                  </div>
                  <div>
                    <div className="kelas-card-name">{kelas.nama}</div>
                    <div className="kelas-card-count">{kelas.anggota.length} siswa</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {isManager && !locked && (
                    <>
                      <ManageKelasAnggotaButton kelasId={kelas.id} namaKelas={kelas.nama} availableSiswa={availableSiswa} />
                      <DeleteKelasButton id={kelas.id} nama={kelas.nama} />
                    </>
                  )}
                </div>
              </div>

              {/* Wali Kelas */}
              <div className="kelas-wali">
                <span className="kelas-wali-label">Wali Kelas</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {kelas.waliKelas ? (
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{kelas.waliKelas.nama}</span>
                  ) : (
                    <span style={{ fontSize: 13, color: "var(--ink-faint)", fontStyle: "italic" }}>Belum ditentukan</span>
                  )}
                  {isManager && !locked && (
                    <SetWaliKelasButton
                      kelasId={kelas.id}
                      currentWaliId={kelas.waliKelas?.id ?? null}
                      allStaff={allStaff}
                    />
                  )}
                </div>
              </div>

              {/* Daftar siswa */}
              {kelas.anggota.length === 0 ? (
                <div style={{ padding: "12px 16px", fontSize: 12.5, color: "var(--ink-faint)", borderTop: "1px solid var(--line-soft)" }}>
                  {locked ? "Belum ada siswa." : "Belum ada siswa. Klik tambah untuk memasukkan siswa."}
                </div>
              ) : (
                <div className="kelas-anggota">
                  {kelas.anggota.map((a, idx) => (
                    <Link key={a.id} href={`/siswa/${a.siswa.id}`} className="kelas-anggota-row">
                      <div className="kelas-anggota-no">{idx + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.siswa.nama}</div>
                        <div style={{ fontSize: 11.5, color: "var(--ink-faint)", fontFamily: "var(--mono)" }}>{a.siswa.nis}</div>
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>{a.siswa.kelas}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
