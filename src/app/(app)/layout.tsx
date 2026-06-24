export const dynamic = "force-dynamic";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Sidebar } from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  let roleLabel: string;
  let dotCls: string;
  let name: string;
  let sub: string;
  const isStaff = session.kind === "staff";

  if (session.kind === "siswa") {
    const siswa = await prisma.siswa.findUnique({
      where: { id: session.sub },
      select: { nama: true, kelas: true },
    });
    roleLabel = "Siswa";
    dotCls = "ortu";
    name = siswa?.nama ?? session.name;
    sub = siswa?.kelas ?? "";
  } else {
    roleLabel = session.role === "KESISWAAN" ? "Kesiswaan" : "BKA";
    dotCls = session.role === "BKA" ? "bka" : "";
    name = session.name;
    sub = "Petugas";
  }

  return (
    <div className="app-root">
      <Topbar roleLabel={roleLabel} name={name} sub={sub} dotCls={dotCls} />
      <div className="app-body">
        {isStaff && <Sidebar />}
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
