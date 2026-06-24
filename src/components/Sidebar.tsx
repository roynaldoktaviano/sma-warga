"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions";
import { IconClipboard, IconCalendar, IconTrophy, IconSettings, IconLogout } from "./icons";

const menus = [
  { href: "/dashboard", label: "Tatib",    icon: IconClipboard },
  { href: "/presensi",  label: "Presensi", icon: IconCalendar  },
  { href: "/prestasi",  label: "Prestasi", icon: IconTrophy    },
];

type Props = { name: string; sub: string; initials: string };

export function Sidebar({ name, sub, initials }: Props) {
  const path = usePathname();
  function active(href: string) { return path === href || path.startsWith(href + "/"); }

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
        {menus.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={"sidebar-link" + (active(href) ? " sidebar-link--active" : "")}>
            <Icon /><span>{label}</span>
          </Link>
        ))}
        <div className="sidebar-group-label">Lainnya</div>
        <Link href="/pengaturan" className={"sidebar-link" + (active("/pengaturan") ? " sidebar-link--active" : "")}>
          <IconSettings /><span>Pengaturan</span>
        </Link>
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
