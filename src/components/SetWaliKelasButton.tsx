"use client";

import { useState, useTransition } from "react";
import { setWaliKelasAction } from "@/app/actions";
import { ModalShell } from "./ModalShell";
import { toast } from "./Toaster";
import { IconPen } from "./icons";

type StaffOpt = { id: string; nama: string; role: string };

export function SetWaliKelasButton({
  kelasId,
  currentWaliId,
  allStaff,
}: {
  kelasId: string;
  currentWaliId: string | null;
  allStaff: StaffOpt[];
}) {
  const [open, setOpen] = useState(false);
  const [waliId, setWaliId] = useState(currentWaliId ?? "");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await setWaliKelasAction(kelasId, waliId || null);
      if (res.ok) {
        toast("Wali kelas diperbarui.");
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
        title="Ubah wali kelas"
        onClick={() => setOpen(true)}
        style={{ color: "var(--ink-faint)" }}
      >
        <IconPen />
      </button>
      {open && (
        <ModalShell
          title="Pilih Wali Kelas"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button type="button" className="btn" onClick={() => setOpen(false)}>Batal</button>
              <button type="submit" form="set-wali-form" className="btn btn-accent" disabled={pending}>
                {pending ? "Menyimpan…" : "Simpan"}
              </button>
            </>
          }
        >
          <form id="set-wali-form" onSubmit={submit}>
            <div className="field">
              <label>Wali Kelas</label>
              <select value={waliId} onChange={e => setWaliId(e.target.value)}>
                <option value="">— Tidak ada —</option>
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
