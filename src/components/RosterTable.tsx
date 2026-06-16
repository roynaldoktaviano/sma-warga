"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "./Avatar";
import { IconSearch, IconUsers } from "./icons";

type Row = { id: string; nama: string; nis: string; kelas: string; poin: number };

export function RosterTable({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const [kelas, setKelas] = useState("");

  const kelasList = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => set.add(r.kelas));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const list = rows.filter((r) => {
      if (kelas && r.kelas !== kelas) return false;
      if (q) {
        const k = q.toLowerCase();
        if (r.nama.toLowerCase().indexOf(k) < 0 && r.nis.indexOf(q) < 0) return false;
      }
      return true;
    });
    list.sort((a, b) => a.poin - b.poin);
    return list;
  }, [rows, q, kelas]);

  return (
    <>
      <div className="toolbar">
        <div className="search">
          <IconSearch />
          <input type="text" placeholder="Cari nama atau NIS…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="filter" value={kelas} onChange={(e) => setKelas(e.target.value)}>
          <option value="">Semua kelas</option>
          {kelasList.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      <div className="roster">
        <div className="roster-head">
          <div>Siswa</div>
          <div>Kelas</div>
          <div>Poin</div>
        </div>
        <div>
          {filtered.length === 0 ? (
            <div className="empty" style={{ borderTop: "1px solid var(--line-soft)" }}>
              <IconUsers />
              <b>Belum ada siswa</b>
              <p>Tambah siswa atau import dari CSV.</p>
            </div>
          ) : (
            filtered.map((s) => (
              <Link key={s.id} href={`/siswa/${s.id}`} className="roster-row" style={{ textDecoration: "none" }}>
                <div className="cell-name">
                  <Avatar name={s.nama} />
                  <div className="name-main">
                    <b>{s.nama}</b>
                    <span className="mono">{s.nis}</span>
                  </div>
                </div>
                <div className="cell-kelas">{s.kelas}</div>
                <div className="cell-poin">{s.poin}</div>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}
