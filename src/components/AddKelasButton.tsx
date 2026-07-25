"use client";

import { useState, useTransition } from "react";
import { addKelasAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { toast } from "./Toaster";
import { IconPlus } from "./icons";

type StaffOpt = { id: string; nama: string; role: string };

export function AddKelasButton({
  tahunAjaranId,
  allStaff,
}: {
  tahunAjaranId: string;
  allStaff: StaffOpt[];
}) {
  const [open, setOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [waliKelasId, setWaliKelasId] = useState("");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await addKelasAction({ nama, tahunAjaranId, waliKelasId: waliKelasId || undefined });
      if (res.ok) {
        toast("Kelas berhasil ditambahkan.");
        setOpen(false);
        setNama("");
        setWaliKelasId("");
      } else {
        toast(res.error, "bad");
      }
    });
  }

  return (
    <>
      <button className="btn btn-accent btn-sm" onClick={() => setOpen(true)}>
        <IconPlus /> Tambah Kelas
      </button>
      {open && (
        <ModalShell
          title="Tambah Kelas"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setOpen(false)}>Batal</button>
              <button type="submit" form="add-kelas-form" className="btn btn-accent" disabled={pending || !nama.trim()}>
                {pending ? "Menyimpan…" : "Tambah Kelas"}
              </button>
            </>
          }
        >
          <form id="add-kelas-form" onSubmit={submit}>
            <div className="field">
              <label>Nama Kelas</label>
              <input
                required
                placeholder="cth. VII A"
                value={nama}
                onChange={e => setNama(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Wali Kelas (opsional)</label>
              <select value={waliKelasId} onChange={e => setWaliKelasId(e.target.value)}>
                <option value="">— Pilih wali kelas —</option>
                {allStaff.map(s => (
                  <option key={s.id} value={s.id}>{s.nama}</option>
                ))}
              </select>
            </div>
          </form>
        </ModalShell>
      )}
    </>
  );
}
