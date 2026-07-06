"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions";
import { IconClipboard, IconCalendar, IconTrophy, IconSettings, IconLogout, IconUsers } from "./icons";
import { canViewTatib, canViewEkskul, canManage } from "@/lib/roles";

type Props = { name: string; sub: string; initials: string; role: string };

export function Sidebar({ name, sub, initials, role }: Props) {
  const path = usePathname();
  function active(href: string) { return path === href || path.startsWith(href + "/"); }

  const showTatib   = canViewTatib(role);
  const showEkskul  = canViewEkskul(role);
  const showSettings = canManage(role);

  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="sidebar-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="sidebar-logo" src="/logo-smp.jpg" alt="SMP Warga" />
        <div>
          <div className="sidebar-brand-name">SMP Warga</div>
          <div className="sidebar-brand-sub">Surakarta</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-group-label">Menu</div>

        {showTatib && (
          <Link href="/dashboard" className={"sidebar-link" + (active("/dashboard") ? " sidebar-link--active" : "")}>
            <IconClipboard /><span>Tatib</span>
          </Link>
        )}
        {showTatib && (
          <Link href="/presensi" className={"sidebar-link" + (active("/presensi") ? " sidebar-link--active" : "")}>
            <IconCalendar /><span>Presensi</span>
          </Link>
        )}
        {showTatib && (
          <Link href="/prestasi" className={"sidebar-link" + (active("/prestasi") ? " sidebar-link--active" : "")}>
            <IconTrophy /><span>Prestasi</span>
          </Link>
        )}
        {showEkskul && (
          <Link href="/ekskul" className={"sidebar-link" + (active("/ekskul") ? " sidebar-link--active" : "")}>
            <IconUsers /><span>Ekskul</span>
          </Link>
        )}

        {showSettings && (
          <>
            <div className="sidebar-group-label">Lainnya</div>
            <Link href="/pengaturan" className={"sidebar-link" + (active("/pengaturan") ? " sidebar-link--active" : "")}>
              <IconSettings /><span>Pengaturan</span>
            </Link>
          </>
        )}
      </nav>

      {/* User + logout */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div>
            <div className="sidebar-user-name">{name}</div>
            <div className="sidebar-user-sub">{sub}</div>
          </div>
        </div>
        <form action={logoutAction} style={{ marginTop: 4 }}>
          <button type="submit" className="sidebar-logout">
            <IconLogout /><span>Keluar</span>
          </button>
        </form>
      </div>

    </aside>
  );
}
