import { requireStaff } from "@/lib/auth";
import { canManage } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PelanggaranManager } from "@/components/KategoriManager";
import { ImportKategoriButton } from "@/components/ImportKategoriButton";

export const dynamic = "force-dynamic";

export default async function PelanggaranPage() {
  const session = await requireStaff();
  if (!canManage(session.role)) redirect("/dashboard");

  const staff = await prisma.staff.findUnique({
    where: { id: session.sub },
    select: { sekolahId: true },
  });
  if (!staff) redirect("/login");

  const items = await prisma.kategoriPelanggaran.findMany({
    where: { sekolahId: staff.sekolahId },
    orderBy: [{ tingkatan: "asc" }, { nama: "asc" }],
    select: { id: true, nama: true, tingkatan: true, poin: true },
  });

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-head-left">
          <div className="eyebrow">Master Data</div>
          <h1 className="page-title">Kategori Pelanggaran</h1>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
            Daftar jenis pelanggaran beserta tingkatan dan pengurangan poin.
          </p>
        </div>
        <div className="page-head-right">
          <ImportKategoriButton mode="pelanggaran" />
        </div>
      </div>
      <PelanggaranManager items={items} />
    </div>
  );
}
