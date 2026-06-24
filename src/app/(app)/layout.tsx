export const dynamic = "force-dynamic";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Sidebar } from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  const isStaff = session.kind === "staff";
  let name: string;
  let sub: string;
  let roleLabel: string;

  if (session.kind === "siswa") {
    const siswa = await prisma.siswa.findUnique({
      where: { id: session.sub },
      select: { nama: true, kelas: true },
    });
    name = siswa?.nama ?? session.name;
    sub = siswa?.kelas ?? "";
    roleLabel = "Siswa";
  } else {
    name = session.name;
    sub = session.role === "KESISWAAN" ? "Kesiswaan" : "BKA";
    roleLabel = sub;
  }

  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  if (isStaff) {
    return (
      <div className="app-root">
        <Sidebar name={name} sub={sub} initials={initials} />
        <main className="app-main">{children}</main>
      </div>
    );
  }

  return (
    <div className="app-root app-root--siswa">
      <Topbar roleLabel={roleLabel} name={name} sub={sub} dotCls="ortu" />
      <main className="app-main">{children}</main>
    </div>
  );
}
