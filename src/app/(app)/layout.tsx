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

  // GURU hanya tampilkan menu Ekskul kalau memang ditugaskan di suatu ekskul
  const hasEkskul = isStaff && session.role === "GURU"
    ? (await prisma.ekskulGuru.count({ where: { staffId: session.sub } })) > 0
    : false;

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
        <Sidebar name={name} sub={sub} initials={initials} role={session.role ?? ""} hasEkskul={hasEkskul} />
        <main className="app-main">{children}</main>
      </div>
    );
  }

  const isOrtu = session.kind === "ortu";
  return (
    <div className="app-root app-root--siswa">
      <Topbar
        roleLabel={isOrtu ? "Orang Tua" : "Siswa"}
        name={name}
        sub={sub}
        dotCls="ortu"
      />
      <main className="app-main">{children}</main>
    </div>
  );
}
