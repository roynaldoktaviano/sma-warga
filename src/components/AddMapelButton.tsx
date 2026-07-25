"use client";

import { useState, useTransition } from "react";
import { addMapelAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { toast } from "./Toaster";
import { IconPlus } from "./icons";

const KELAS_OPTIONS = ["7", "8", "9"];

export function AddMapelButton() {
  const [open, setOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [kode, setKode] = useState("");
  const [kelasSet, setKelasSet] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();

  function toggleKelas(k: string) {
    setKelasSet(prev => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  }

  function reset() { setNama(""); setKode(""); setKelasSet(new Set()); }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const kelas = KELAS_OPTIONS.filter(k => kelasSet.has(k));
      const res = await addMapelAction({ nama, kode, kelas });
      if (res.ok) {
        toast("Mata pelajaran berhasil ditambahkan.");
        setOpen(false);
        reset();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  const kelasLabel = KELAS_OPTIONS.filter(k => kelasSet.has(k));

  return (
    <>
      <button className="btn btn-accent btn-sm" onClick={() => { reset(); setOpen(true); }}>
        <IconPlus /> Mata Pelajaran
      </button>
      {open && (
        <ModalShell
          title="Tambah Mata Pelajaran"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setOpen(false)}>Batal</button>
              <button type="submit" form="add-mapel-form" className="btn btn-accent" disabled={pending || !nama.trim()}>
                {pending ? "Menyimpan…" : "Tambah"}
              </button>
            </>
          }
        >
          <form id="add-mapel-form" onSubmit={submit}>
            <div className="two">
              <div className="field">
                <label>Kode</label>
                <input
                  placeholder="cth. A, G…"
                  value={kode}
                  onChange={e => setKode(e.target.value.toUpperCase())}
                  maxLength={8}
                />
              </div>
              <div className="field" style={{ flex: 2 }}>
                <label>Nama Mata Pelajaran</label>
                <input
                  required
                  placeholder="cth. Matematika, IPA…"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="field">
              <label>Kelas</label>
              <div className="mapel-kelas-picker">
                {KELAS_OPTIONS.map(k => (
                  <label key={k} className={"mapel-kelas-opt" + (kelasSet.has(k) ? " mapel-kelas-opt--on" : "")}>
                    <input
                      type="checkbox"
                      checked={kelasSet.has(k)}
                      onChange={() => toggleKelas(k)}
                      style={{ display: "none" }}
                    />
                    Kelas {k}
                  </label>
                ))}
                <span className="mapel-kelas-hint">
                  {kelasLabel.length === 0 ? "Semua kelas" : `Kelas ${kelasLabel.join(", ")}`}
                </span>
              </div>
            </div>
          </form>
        </ModalShell>
      )}
    </>
  );
}
