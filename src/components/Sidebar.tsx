"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions";
import {
  IconClipboard, IconCalendar, IconSettings, IconLogout,
  IconUsers, IconBook, IconStar, IconDown, IconTrophy,
  IconGauge, IconChevron,
} from "./icons";
import { canViewTatib, canViewEkskul, canManage } from "@/lib/roles";

type Props = { name: string; sub: string; initials: string; role: string; hasEkskul?: boolean };

const TATIB_PATHS = ["/dashboard", "/catatan", "/prestasi"];

export function Sidebar({ name, sub, initials, role, hasEkskul = false }: Props) {
  const path = usePathname();
  function active(href: string) { return path === href || path.startsWith(href + "/"); }

  const showTatib    = canViewTatib(role);
  const showEkskul   = canViewEkskul(role) || hasEkskul;
  const showSettings = canManage(role);

  const tatibActive = TATIB_PATHS.some(p => path === p || path.startsWith(p + "/"));
  const [tatibOpen, setTatibOpen] = useState(tatibActive);

  useEffect(() => {
    if (tatibActive) setTatibOpen(true);
  }, [tatibActive]);

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
          <Link href="/siswa" className={"sidebar-link" + (active("/siswa") ? " sidebar-link--active" : "")}>
            <IconUsers /><span>Siswa</span>
          </Link>
        )}

        {showTatib && (
          <>
            <button
              type="button"
              aria-expanded={tatibOpen}
              onClick={() => setTatibOpen(o => !o)}
              className={"sidebar-group-trigger" + (tatibActive ? " sidebar-group-trigger--active" : "")}
            >
              <IconClipboard />
              <span>Tatib</span>
              <IconChevron className="sidebar-group-chevron" />
            </button>
            {tatibOpen && (
              <div className="sidebar-sub">
                <Link href="/dashboard" className={"sidebar-sub-link" + (active("/dashboard") ? " sidebar-sub-link--active" : "")}>
                  <IconGauge /><span>Dashboard</span>
                </Link>
                <Link href="/catatan" className={"sidebar-sub-link" + (active("/catatan") ? " sidebar-sub-link--active" : "")}>
                  <IconDown /><span>Pelanggaran</span>
                </Link>
                <Link href="/prestasi" className={"sidebar-sub-link" + (active("/prestasi") ? " sidebar-sub-link--active" : "")}>
                  <IconTrophy /><span>Prestasi</span>
                </Link>
              </div>
            )}
          </>
        )}

        {showTatib && (
          <Link href="/presensi" className={"sidebar-link" + (active("/presensi") ? " sidebar-link--active" : "")}>
            <IconCalendar /><span>Presensi</span>
          </Link>
        )}
        {showEkskul && (
          <Link href="/ekskul" className={"sidebar-link" + (active("/ekskul") ? " sidebar-link--active" : "")}>
            <IconStar /><span>Ekskul</span>
          </Link>
        )}

        {showSettings && (
          <>
            <div className="sidebar-group-label">Master Data</div>
            <Link href="/pelanggaran" className={"sidebar-link" + (active("/pelanggaran") ? " sidebar-link--active" : "")}>
              <IconDown /><span>Pelanggaran</span>
            </Link>
            <Link href="/kategori-prestasi" className={"sidebar-link" + (active("/kategori-prestasi") ? " sidebar-link--active" : "")}>
              <IconBook /><span>Prestasi</span>
            </Link>
            <div className="sidebar-group-label">Sistem</div>
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
