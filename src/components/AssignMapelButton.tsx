"use client";

import { useState, useTransition, useMemo } from "react";
import { setGuruMapelAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { toast } from "./Toaster";
import { IconBook } from "./icons";

type MapelOpt = { id: string; nama: string; kode: string | null };

export function AssignMapelButton({
  staffId,
  namaGuru,
  allMapel,
  currentIds,
}: {
  staffId: string;
  namaGuru: string;
  allMapel: MapelOpt[];
  currentIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(currentIds));
  const [pending, start] = useTransition();

  // Reset selection when modal opens
  function openModal() {
    setSelected(new Set(currentIds));
    setOpen(true);
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const changed = useMemo(() => {
    if (selected.size !== currentIds.length) return true;
    return !currentIds.every(id => selected.has(id));
  }, [selected, currentIds]);

  function submit() {
    start(async () => {
      const res = await setGuruMapelAction(staffId, Array.from(selected));
      if (res.ok) {
        toast(`Mata pelajaran ${namaGuru} diperbarui.`);
        setOpen(false);
      } else {
        toast(res.error, "bad");
      }
    });
  }

  return (
    <>
      <button
        className="btn-icon-del"
        title="Atur mata pelajaran"
        onClick={openModal}
        style={{ color: "var(--ink-faint)" }}
      >
        <IconBook />
      </button>
      {open && (
        <ModalShell
          title={`Mapel — ${namaGuru}`}
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn" onClick={() => setOpen(false)}>Batal</button>
              <button
                className="btn btn-accent"
                onClick={submit}
                disabled={pending || !changed}
              >
                {pending ? "Menyimpan…" : "Simpan"}
              </button>
            </>
          }
        >
          {allMapel.length === 0 ? (
            <div style={{ padding: "8px 0", fontSize: 13, color: "var(--ink-faint)" }}>
              Belum ada mata pelajaran. Tambah di halaman Mata Pelajaran terlebih dahulu.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {allMapel.map(m => (
                <label
                  key={m.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    background: selected.has(m.id) ? "var(--accent-soft)" : "transparent",
                    transition: "background .08s",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(m.id)}
                    onChange={() => toggle(m.id)}
                    style={{ accentColor: "var(--accent)", flexShrink: 0 }}
                  />
                  {m.kode && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "1px 6px",
                      borderRadius: 3, background: "var(--line-soft)",
                      color: "var(--ink-soft)", fontFamily: "var(--mono)", flexShrink: 0,
                    }}>
                      {m.kode}
                    </span>
                  )}
                  <span style={{ fontSize: 13.5 }}>{m.nama}</span>
                </label>
              ))}
            </div>
          )}
          {selected.size > 0 && (
            <div style={{ marginTop: 10, fontSize: 12.5, color: "var(--accent)", fontWeight: 500 }}>
              {selected.size} mata pelajaran dipilih
            </div>
          )}
        </ModalShell>
      )}
    </>
  );
}
