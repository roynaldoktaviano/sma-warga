"use client";

import { useState, useTransition } from "react";
import { addKelasAnggotaAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { toast } from "./Toaster";
import { IconPlus, IconSearch } from "./icons";
import { useMemo } from "react";

type SiswaOpt = { id: string; nama: string; nis: string; kelas: string };

export function ManageKelasAnggotaButton({
  kelasId,
  namaKelas,
  availableSiswa,
}: {
  kelasId: string;
  namaKelas: string;
  availableSiswa: SiswaOpt[];
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();

  const filtered = useMemo(() =>
    q.trim() === ""
      ? availableSiswa
      : availableSiswa.filter(s =>
          s.nama.toLowerCase().includes(q.toLowerCase()) ||
          s.nis.includes(q) ||
          s.kelas.toLowerCase().includes(q.toLowerCase())
        ),
    [availableSiswa, q]);

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit() {
    if (selected.size === 0) return;
    start(async () => {
      const res = await addKelasAnggotaAction(kelasId, Array.from(selected));
      if (res.ok) {
        toast(`${selected.size} siswa ditambahkan ke kelas ${namaKelas}.`);
        setOpen(false);
        setSelected(new Set());
        setQ("");
      } else {
        toast(res.error, "bad");
      }
    });
  }

  return (
    <>
      <button
        className="btn btn-sm"
        onClick={() => setOpen(true)}
        disabled={availableSiswa.length === 0}
        title={availableSiswa.length === 0 ? "Semua siswa sudah masuk kelas" : "Tambah siswa ke kelas"}
      >
        <IconPlus /> Siswa
      </button>
      {open && (
        <ModalShell
          title={`Tambah Siswa ke ${namaKelas}`}
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn" onClick={() => setOpen(false)}>Batal</button>
              <button
                className="btn btn-accent"
                onClick={submit}
                disabled={pending || selected.size === 0}
              >
                {pending ? "Menyimpan…" : `Tambah ${selected.size > 0 ? selected.size + " Siswa" : ""}`}
              </button>
            </>
          }
        >
          <div className="stu-search" style={{ marginBottom: 8, borderRadius: "var(--radius-sm)", border: "1px solid var(--line)" }}>
            <IconSearch />
            <input
              placeholder="Cari nama, NIS, atau kelas…"
              value={q}
              onChange={e => setQ(e.target.value)}
              autoFocus
            />
          </div>
          <div style={{ maxHeight: 320, overflowY: "auto", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)" }}>
            {filtered.length === 0 ? (
              <div className="stu-empty">Tidak ada siswa yang cocok.</div>
            ) : (
              filtered.map(s => (
                <label
                  key={s.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                    cursor: "pointer", borderBottom: "1px solid var(--line-soft)",
                    background: selected.has(s.id) ? "var(--accent-soft)" : "transparent",
                    transition: "background .08s",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={() => toggle(s.id)}
                    style={{ flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{s.nama}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{s.kelas} · {s.nis}</div>
                  </div>
                </label>
              ))
            )}
          </div>
          {selected.size > 0 && (
            <div style={{ marginTop: 10, fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>
              {selected.size} siswa dipilih
            </div>
          )}
        </ModalShell>
      )}
    </>
  );
}
