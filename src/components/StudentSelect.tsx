"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { IconSearch, IconX } from "./icons";

type Student = { id: string; nama: string; kelas: string };

type Props = {
  students: Student[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
};

export function StudentSelect({ students, value, onChange, placeholder = "Cari nama atau NIS…" }: Props) {
  const [open, setOpen]   = useState(false);
  const [q, setQ]         = useState("");
  const wrapRef           = useRef<HTMLDivElement>(null);
  const inputRef          = useRef<HTMLInputElement>(null);

  const selected = students.find((s) => s.id === value);

  const filtered = useMemo(() => {
    if (!q) return students;
    const k = q.toLowerCase();
    return students.filter((s) => s.nama.toLowerCase().includes(k) || s.kelas.toLowerCase().includes(k));
  }, [students, q]);

  // tutup kalau klik di luar
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function openDropdown() {
    setQ("");
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 10);
  }

  function pick(s: Student) {
    onChange(s.id);
    setOpen(false);
    setQ("");
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setOpen(false);
  }

  return (
    <div className="stu-select" ref={wrapRef}>
      {/* trigger */}
      <button type="button" className={"stu-trigger" + (open ? " stu-trigger--open" : "")} onClick={openDropdown}>
        {selected ? (
          <span className="stu-chosen">
            <b>{selected.nama}</b>
            <span className="stu-kelas">{selected.kelas}</span>
          </span>
        ) : (
          <span className="stu-placeholder">— Pilih siswa —</span>
        )}
        {selected
          ? <span className="stu-clear" onClick={clear}><IconX /></span>
          : <span className="stu-arrow">⌄</span>
        }
      </button>

      {/* dropdown */}
      {open && (
        <div className="stu-dropdown">
          <div className="stu-search">
            <IconSearch />
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <ul className="stu-list">
            {filtered.length === 0 ? (
              <li className="stu-empty">Tidak ada siswa ditemukan</li>
            ) : (
              filtered.map((s) => (
                <li
                  key={s.id}
                  className={"stu-item" + (s.id === value ? " stu-item--active" : "")}
                  onMouseDown={(e) => { e.preventDefault(); pick(s); }}
                >
                  <b>{s.nama}</b>
                  <span>{s.kelas}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
