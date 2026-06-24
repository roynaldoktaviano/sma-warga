import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountForm } from "@/components/AccountForm";
import { AddStaffModalButton } from "@/components/AddStaffModalButton";
import { DeleteStaffButton } from "@/components/DeleteStaffButton";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = { KESISWAAN: "Kesiswaan", BKA: "BKA" };

export default async function PengaturanPage() {
  const session = await requireStaff();

  const [staff, allStaff] = await Promise.all([
    prisma.staff.findUnique({
      where: { id: session.sub },
      select: { id: true, nama: true, username: true, role: true },
    }),
    prisma.staff.findMany({
      orderBy: { nama: "asc" },
      select: { id: true, nama: true, username: true, role: true },
    }),
  ]);

  if (!staff) return null;

  const initials = staff.nama.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

  return (
    <div className="shell">
      <div className="page-head">
        <div className="page-head-left">
          <div className="eyebrow">Sistem</div>
          <h1 className="page-title">Pengaturan Akun</h1>
        </div>
      </div>

      {/* Akun saya */}
      <div className="settings-grid">
        <div className="card card-pad" style={{ textAlign: "center" }}>
          <div className="settings-avatar">{initials}</div>
          <div className="settings-name">{staff.nama}</div>
          <div className="settings-meta">@{staff.username}</div>
          <div className="settings-meta">{ROLE_LABEL[staff.role] ?? staff.role}</div>
        </div>
        <AccountForm staff={{ nama: staff.nama, username: staff.username }} />
      </div>

      {/* Daftar semua akun */}
      <div style={{ marginTop: 24 }}>
        <div className="page-head" style={{ marginBottom: 12 }}>
          <div className="page-head-left">
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Semua Akun Petugas</h2>
          </div>
          <div className="page-head-right">
            <AddStaffModalButton />
          </div>
        </div>
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="staff-list-head">
            <span>Nama</span>
            <span>Username</span>
            <span>Role</span>
            <span />
          </div>
          {allStaff.map((s) => (
            <div key={s.id} className="staff-list-row">
              <span style={{ fontWeight: 500 }}>{s.nama}</span>
              <span style={{ color: "var(--ink-soft)", fontFamily: "var(--mono)", fontSize: 13 }}>@{s.username}</span>
              <span className="role-badge">{ROLE_LABEL[s.role] ?? s.role}</span>
              <DeleteStaffButton id={s.id} isSelf={s.id === session.sub} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
