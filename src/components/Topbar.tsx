import { logoutAction } from "@/app/actions";
import { IconLogout } from "./icons";

export function Topbar({
  roleLabel,
  name,
  sub,
  dotCls,
}: {
  roleLabel: string;
  name: string;
  sub: string;
  dotCls: string;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="topbar">
      <div className="topbar-stripe" />
      <div className="topbar-in">

        <div className="brand">
          <div className="brand-crest">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-sma-warga.png" alt="SMP Warga Surakarta" />
          </div>
          <div className="brand-text">
            <div className="brand-name">SMP Warga Surakarta</div>
            <div className="brand-sub">Sistem Poin &amp; Karakter Siswa</div>
          </div>
        </div>

        <div className="topbar-right">
          <div className={"role-badge role-badge--" + (dotCls || "ks")}>
            <span className="role-badge-dot" />
            {roleLabel}
          </div>

          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name">{name}</span>
              <span className="user-sub">{sub}</span>
            </div>
          </div>

          <form action={logoutAction}>
            <button type="submit" className="topbar-logout" title="Keluar">
              <IconLogout />
              <span>Keluar</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
