"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "./Avatar";
import { IconSearch, IconUsers } from "./icons";

const PER_PAGE = 25;

type Row = {
  id: string; nama: string; nis: string; nisn?: string | null;
  kelas: string; jenisKelamin: string; agama: string; poin: number;
};

export function RosterTable({ rows }: { rows: Row[] }) {
  const [q, setQ]       = useState("");
  const [kelas, setKelas] = useState("");
  const [page, setPage]   = useState(1);

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
        return (
          r.nama.toLowerCase().includes(k) ||
          r.nis.includes(q) ||
          (r.nisn?.includes(q) ?? false)
        );
      }
      return true;
    });
    list.sort((a, b) => a.nama.localeCompare(b.nama, "id"));
    return list;
  }, [rows, q, kelas]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function onSearch(v: string) { setQ(v); setPage(1); }
  function onKelas(v: string)  { setKelas(v); setPage(1); }

  // Halaman yang ditampilkan (max 5 tombol)
  const pageNums = useMemo(() => {
    const nums: number[] = [];
    const half = 2;
    let start = Math.max(1, safePage - half);
    let end   = Math.min(totalPages, safePage + half);
    if (end - start < 4) {
      start = Math.max(1, end - 4);
      end   = Math.min(totalPages, start + 4);
    }
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }, [safePage, totalPages]);

  const from = filtered.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1;
  const to   = Math.min(safePage * PER_PAGE, filtered.length);

  return (
    <>
      <div className="toolbar">
        <div className="search">
          <IconSearch />
          <input
            type="text"
            placeholder="Cari nama, NIS, atau NISN…"
            value={q}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <select className="filter" value={kelas} onChange={(e) => onKelas(e.target.value)}>
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
          <div>L/P</div>
          <div>Poin</div>
        </div>

        {paged.length === 0 ? (
          <div className="empty" style={{ borderTop: "1px solid var(--line-soft)" }}>
            <IconUsers />
            <b>Belum ada siswa</b>
            <p>Tambah siswa atau import dari CSV.</p>
          </div>
        ) : (
          paged.map((s) => (
            <Link key={s.id} href={`/siswa/${s.id}`} className="roster-row" style={{ textDecoration: "none" }}>
              <div className="cell-name">
                <Avatar name={s.nama} />
                <div className="name-main">
                  <b>{s.nama}</b>
                  <span className="mono">{s.nis}{s.nisn ? ` · ${s.nisn}` : ""}</span>
                </div>
              </div>
              <div className="cell-kelas">{s.kelas}</div>
              <div className="cell-small">{s.jenisKelamin || "—"}</div>
              <div className="cell-poin">{s.poin}</div>
            </Link>
          ))
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">
              {from}–{to} dari {filtered.length} siswa
            </span>
            <div className="pagination-btns">
              <button className="page-btn" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>‹</button>
              {pageNums[0] > 1 && (
                <>
                  <button className="page-btn" onClick={() => setPage(1)}>1</button>
                  {pageNums[0] > 2 && <span style={{ padding: "0 4px", color: "var(--ink-faint)" }}>…</span>}
                </>
              )}
              {pageNums.map((n) => (
                <button
                  key={n}
                  className={"page-btn" + (n === safePage ? " page-btn--active" : "")}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              {pageNums[pageNums.length - 1] < totalPages && (
                <>
                  {pageNums[pageNums.length - 1] < totalPages - 1 && <span style={{ padding: "0 4px", color: "var(--ink-faint)" }}>…</span>}
                  <button className="page-btn" onClick={() => setPage(totalPages)}>{totalPages}</button>
                </>
              )}
              <button className="page-btn" disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>›</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
