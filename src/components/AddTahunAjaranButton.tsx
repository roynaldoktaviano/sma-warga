"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addTahunAjaranAction } from "@/app/actions";
import { toast } from "./Toaster";
import { IconPlus } from "./icons";

export function AddTahunAjaranButton() {
  const [open, setOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await addTahunAjaranAction(nama);
      if (res.ok) {
        toast("Tahun ajaran berhasil ditambahkan.");
        setOpen(false);
        setNama("");
        router.refresh();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  return (
    <>
      <button className="btn btn-accent" onClick={() => setOpen(true)}>
        <IconPlus /> Tahun Ajaran
      </button>

      {open && (
        <div className="modal-mask" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">Tambah Tahun Ajaran</span>
              <button className="modal-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            <form onSubmit={submit}>
              <div className="modal-body">
                <div className="field">
                  <label className="field-label">Nama Tahun Ajaran</label>
                  <input
                    className="input"
                    placeholder="Contoh: 2024/2025"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-accent" disabled={pending}>
                  {pending ? "Menyimpan…" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
