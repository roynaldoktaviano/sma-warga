"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addEkskulAnggotaAction } from "@/app/actions";
import { toast } from "./Toaster";
import { ModalShell } from "./ModalShell";
import { IconPlus } from "./icons";

type SiswaItem = { id: string; nama: string; nis: string; kelas: string };

export function ManageEkskulAnggotaButton({
  ekskulId,
  availableSiswa,
}: {
  ekskulId: string;
  availableSiswa: SiswaItem[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  const filtered = availableSiswa.filter(s =>
    s.nama.toLowerCase().includes(query.toLowerCase()) ||
    s.nis.includes(query) ||
    s.kelas.toLowerCase().includes(query.toLowerCase())
  );

  function toggle(id: string) {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  function submit() {
    if (selected.size === 0) return;
    start(async () => {
      const res = await addEkskulAnggotaAction(ekskulId, Array.from(selected));
      if (res.ok) {
        toast(`${selected.size} siswa berhasil ditambahkan.`);
        setOpen(false);
        setSelected(new Set());
        setQuery("");
        router.refresh();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  return (
    <>
      <button className="btn btn-sm" onClick={() => setOpen(true)}>
        <IconPlus /> Anggota
      </button>

      {open && (
        <ModalShell
          title="Tambah Anggota"
          onClose={() => setOpen(false)}
          wide
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>Batal</button>
              <button className="btn btn-accent" disabled={pending || selected.size === 0} onClick={submit}>
                {pending ? "Menyimpan…" : `Tambah${selected.size > 0 ? ` (${selected.size})` : ""}`}
              </button>
            </>
          }
        >
          <input
            className="input"
            placeholder="Cari nama / NIS / kelas…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div style={{ marginTop: 10, maxHeight: 320, overflowY: "auto", border: "1px solid var(--line-soft)", borderRadius: 8 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "14px 16px", fontSize: 13, color: "var(--ink-faint)" }}>Tidak ada siswa.</div>
            ) : (
              filtered.map(s => (
                <label key={s.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                  cursor: "pointer", borderBottom: "1px solid var(--line-soft)",
                  background: selected.has(s.id) ? "var(--accent-soft)" : "transparent",
                  transition: "background .1s",
                }}>
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={() => toggle(s.id)}
                    style={{ accentColor: "var(--accent)", width: 15, height: 15, flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.nama}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>{s.kelas} · {s.nis}</div>
                  </div>
                </label>
              ))
            )}
          </div>
          {selected.size > 0 && (
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--ink-soft)" }}>
              {selected.size} siswa dipilih
            </p>
          )}
        </ModalShell>
      )}
    </>
  );
}
