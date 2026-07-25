import { requireStaff } from "@/lib/auth";
import { canManage } from "@/lib/roles";
import { ROLE_LABEL } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { AccountForm } from "@/components/AccountForm";
import { ResetPasswordSiswaButton } from "@/components/ResetPasswordSiswaButton";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const session = await requireStaff();

  const staff = await prisma.staff.findUnique({
    where: { id: session.sub },
    select: { id: true, nama: true, username: true, role: true },
  });

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

      {/* Reset password siswa */}
      <div style={{ marginTop: 24 }}>
        <div className="card card-pad">
          <div className="settings-section-title">Reset Password Siswa</div>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 14 }}>
            Reset password semua siswa menjadi <b>NIS</b> masing-masing. Gunakan ini setelah import data baru atau jika siswa lupa password.
            Login siswa menggunakan <b>NISN</b> sebagai username dan <b>NIS</b> sebagai kata sandi default.
          </p>
          <ResetPasswordSiswaButton />
        </div>
      </div>
    </div>
  );
}
