export const dynamic = "force-dynamic";

import { requireSession, ROLE_LABEL } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Sidebar } from "@/components/Sidebar";
import type { StaffRole } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  const isStaff = session.kind === "staff";
  let name: string;
  let sub: string;

  if (session.kind === "siswa") {
    const siswa = await prisma.siswa.findUnique({
      where: { id: session.sub },
      select: { nama: true, kelas: true },
    });
    name = siswa?.nama ?? session.name;
    sub = siswa?.kelas ?? "";
  } else {
    name = session.name;
    sub = ROLE_LABEL[session.role as StaffRole] ?? session.role ?? "";
  }

  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  if (isStaff) {
    return (
      <div className="app-root">
        <Sidebar name={name} sub={sub} initials={initials} role={session.role ?? ""} />
        <main className="app-main">{children}</main>
      </div>
    );
  }

  return (
    <div className="app-root app-root--siswa">
      <Topbar roleLabel="Siswa" name={name} sub={sub} dotCls="ortu" />
      <main className="app-main">{children}</main>
    </div>
  );
}
