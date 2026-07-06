"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addEkskulAction } from "@/app/actions";
import { toast } from "./Toaster";
import { IconPlus } from "./icons";

export function AddEkskulButton({ tahunAjaranId }: { tahunAjaranId: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nama: "", deskripsi: "" });
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await addEkskulAction({ ...form, tahunAjaranId });
      if (res.ok) {
        toast("Ekskul berhasil ditambahkan.");
        setOpen(false);
        setForm({ nama: "", deskripsi: "" });
        router.refresh();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  return (
    <>
      <button className="btn btn-sm" onClick={() => setOpen(true)}>
        <IconPlus /> Ekskul
      </button>

      {open && (
        <div className="modal-mask" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">Tambah Ekskul</span>
              <button className="modal-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            <form onSubmit={submit}>
              <div className="modal-body">
                <div className="field">
                  <label className="field-label">Nama Ekskul</label>
                  <input
                    className="input"
                    placeholder="Contoh: Pramuka"
                    value={form.nama}
                    onChange={(e) => setForm(f => ({ ...f, nama: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>
                <div className="field">
                  <label className="field-label">Deskripsi (opsional)</label>
                  <input
                    className="input"
                    placeholder="Deskripsi singkat ekskul"
                    value={form.deskripsi}
                    onChange={(e) => setForm(f => ({ ...f, deskripsi: e.target.value }))}
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
