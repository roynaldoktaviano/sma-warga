"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconClipboard, IconCalendar, IconTrophy } from "./icons";

const menus = [
  { href: "/dashboard", label: "Tatib", icon: IconClipboard },
  { href: "/presensi",  label: "Presensi", icon: IconCalendar },
  { href: "/prestasi",  label: "Prestasi", icon: IconTrophy },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menus.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link key={href} href={href} className={"sidebar-link" + (active ? " sidebar-link--active" : "")}>
              <Icon />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
