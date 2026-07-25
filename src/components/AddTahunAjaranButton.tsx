"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addTahunAjaranAction } from "@/app/actions";
import { toast } from "./Toaster";
import { ModalShell } from "./ModalShell";
import { IconPlus } from "./icons";

export function AddTahunAjaranButton() {
  const [open, setOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [semester, setSemester] = useState<"GANJIL" | "GENAP">("GANJIL");
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await addTahunAjaranAction(nama, semester);
      if (res.ok) {
        toast("Tahun ajaran berhasil ditambahkan.");
        setOpen(false);
        setNama("");
        setSemester("GANJIL");
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
        <ModalShell
          title="Tambah Tahun Ajaran"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Batal</button>
              <button form="form-ta" type="submit" className="btn btn-accent" disabled={pending || !nama.trim()}>
                {pending ? "Menyimpan…" : "Simpan"}
              </button>
            </>
          }
        >
          <form id="form-ta" onSubmit={submit}>
            <div className="field">
              <label className="field-label">Tahun Ajaran</label>
              <input
                className="input"
                placeholder="Contoh: 2024/2025"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="field">
              <label className="field-label">Semester</label>
              <select value={semester} onChange={e => setSemester(e.target.value as "GANJIL" | "GENAP")}>
                <option value="GANJIL">Ganjil (Semester 1)</option>
                <option value="GENAP">Genap (Semester 2)</option>
              </select>
            </div>
          </form>
        </ModalShell>
      )}
    </>
  );
}
