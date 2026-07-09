import { requireStaff } from "@/lib/auth";
import { canManage } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PrestasiManager } from "@/components/KategoriManager";
import { ImportKategoriButton } from "@/components/ImportKategoriButton";

export const dynamic = "force-dynamic";

export default async function KategoriPrestasiPage() {
  const session = await requireStaff();
  if (!canManage(session.role)) redirect("/dashboard");

  const staff = await prisma.staff.findUnique({
    where: { id: session.sub },
    select: { sekolahId: true },
  });
  if (!staff) redirect("/login");

  const items = await prisma.kategoriPrestasi.findMany({
    where: { sekolahId: staff.sekolahId },
    orderBy: [{ tingkatan: "asc" }, { nama: "asc" }],
    select: { id: true, nama: true, tingkatan: true, poin: true },
  });

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-head-left">
          <div className="eyebrow">Master Data</div>
          <h1 className="page-title">Kategori Prestasi</h1>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
            Daftar jenis prestasi beserta tingkatan dan penambahan poin.
          </p>
        </div>
        <div className="page-head-right">
          <ImportKategoriButton mode="prestasi" />
        </div>
      </div>
      <PrestasiManager items={items} />
    </div>
  );
}
