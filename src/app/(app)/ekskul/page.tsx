import { requireStaff, canManage, canVerify } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IconUsers, IconFlag } from "@/components/icons";
import { AddEkskulButton } from "@/components/AddEkskulButton";

export const dynamic = "force-dynamic";

const TA_LABEL: Record<string, string> = {
  PERSIAPAN: "Persiapan",
  BERJALAN:  "Berjalan",
  SELESAI:   "Selesai",
};

function semLabel(s: string) { return s === "GANJIL" ? "Ganjil" : "Genap"; }

export default async function EkskulPage() {
  const session = await requireStaff();

  const isAdmin   = canVerify(session.role);
  const isManager = canManage(session.role);

  // Guru (GURU / GURU_EKSKUL): langsung ke ekskul mereka, tanpa halaman daftar
  if (!isAdmin) {
    const myEkskul = await prisma.ekskulGuru.findMany({
      where: { staffId: session.sub },
      include: {
        ekskul: {
          include: {
            tahunAjaran: { select: { nama: true, semester: true, status: true } },
            _count: { select: { anggota: true } },
          },
        },
      },
      orderBy: { ekskul: { nama: "asc" } },
    });

    if (myEkskul.length === 0) redirect("/dashboard");
    if (myEkskul.length === 1) redirect(`/ekskul/${myEkskul[0].ekskulId}`);

    return (
      <div className="shell">
        <div className="page-head">
          <div>
            <div className="eyebrow">Ekstrakulikuler</div>
            <h1 className="page-title">Ekskul Saya</h1>
          </div>
        </div>
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="ekskul-head">
            <span>Nama Ekskul</span>
            <span>Tahun Ajaran</span>
            <span>Anggota</span>
            <span>Status</span>
          </div>
          {myEkskul.map((a) => (
            <Link key={a.ekskulId} href={`/ekskul/${a.ekskulId}`} className="ekskul-row ekskul-row--link">
              <span style={{ fontWeight: 500 }}>{a.ekskul.nama}</span>
              <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{a.ekskul.tahunAjaran.nama} {semLabel(a.ekskul.tahunAjaran.semester)}</span>
              <span style={{ fontSize: 13 }}>{a.ekskul._count.anggota} siswa</span>
              <span className={"ta-status ta-status--" + a.ekskul.tahunAjaran.status.toLowerCase()}>
                {TA_LABEL[a.ekskul.tahunAjaran.status] ?? a.ekskul.tahunAjaran.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Admin: tampilkan semua tahun ajaran dengan ekskulnya
  const allStaff = isManager
    ? await prisma.staff.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true, role: true } })
    : [];

  const tahunList = await prisma.tahunAjaran.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    include: {
      ekskul: {
        include: {
          _count: { select: { anggota: true } },
          guru: { include: { staff: { select: { nama: true } } } },
        },
        orderBy: { nama: "asc" },
      },
    },
  });

  return (
    <div className="shell">
      <div className="page-head">
        <div>
          <div className="eyebrow">Ekstrakulikuler</div>
          <h1 className="page-title">Kelola Ekskul</h1>
        </div>
        {isManager && (
          <div className="page-actions">
            <Link href="/tahun-ajaran" className="btn btn-ghost btn-sm">
              <IconFlag /> Tahun Ajaran
            </Link>
          </div>
        )}
      </div>

      {tahunList.length === 0 ? (
        <div className="empty">
          <IconUsers />
          <b>Belum ada tahun ajaran</b>
          <p>
            <Link href="/tahun-ajaran" style={{ color: "var(--accent)" }}>Tambah tahun ajaran</Link>{" "}
            untuk mulai mengelola ekskul.
          </p>
        </div>
      ) : (
        tahunList.map((ta) => (
          <div key={ta.id} style={{ marginBottom: 28 }}>
            <div className="page-head" style={{ marginBottom: 10, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{ta.nama} <span className={"ta-sem-chip ta-sem-chip--" + ta.semester.toLowerCase()} style={{ fontSize: 12, fontWeight: 500, verticalAlign: "middle" }}>{semLabel(ta.semester)}</span></h2>
                <span className={"ta-status ta-status--" + ta.status.toLowerCase()}>
                  {TA_LABEL[ta.status] ?? ta.status}
                </span>
                {ta.isActive && <span className="ta-active-badge">Aktif</span>}
              </div>
              {isManager && ta.status === "PERSIAPAN" && (
                <AddEkskulButton tahunAjaranId={ta.id} allStaff={allStaff} />
              )}
            </div>

            <div className="card" style={{ overflow: "hidden" }}>
              {ta.ekskul.length === 0 ? (
                <div style={{ padding: "20px 18px", color: "var(--ink-faint)", fontSize: 13 }}>
                  Belum ada ekskul di tahun ajaran ini.
                </div>
              ) : (
                <>
                  <div className="ekskul-head">
                    <span>Nama Ekskul</span>
                    <span>Pembina</span>
                    <span>Anggota</span>
                    <span>Status</span>
                  </div>
                  {ta.ekskul.map((e) => (
                    <Link key={e.id} href={`/ekskul/${e.id}`} className="ekskul-row ekskul-row--link">
                      <span style={{ fontWeight: 500 }}>{e.nama}</span>
                      <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                        {e.guru.map(g => g.staff.nama).join(", ") || "—"}
                      </span>
                      <span style={{ fontSize: 13 }}>{e._count.anggota} siswa</span>
                      <span className={"ta-status ta-status--" + ta.status.toLowerCase()}>
                        {TA_LABEL[ta.status] ?? ta.status}
                      </span>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
