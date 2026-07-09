"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addEkskulAction } from "@/app/actions";
import { toast } from "./Toaster";
import { ModalShell } from "./ModalShell";
import { IconPlus } from "./icons";

type StaffItem = { id: string; nama: string; role: string };

export function AddEkskulButton({
  tahunAjaranId,
  allStaff,
}: {
  tahunAjaranId: string;
  allStaff: StaffItem[];
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nama: "", deskripsi: "" });
  const [selectedGuru, setSelectedGuru] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();
  const router = useRouter();

  function toggleGuru(id: string) {
    setSelectedGuru(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await addEkskulAction({
        ...form,
        tahunAjaranId,
        guruIds: Array.from(selectedGuru),
      });
      if (res.ok) {
        toast("Ekskul berhasil ditambahkan.");
        setOpen(false);
        setForm({ nama: "", deskripsi: "" });
        setSelectedGuru(new Set());
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
        <ModalShell
          title="Tambah Ekskul"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Batal</button>
              <button form="form-ekskul" type="submit" className="btn btn-accent" disabled={pending}>
                {pending ? "Menyimpan…" : "Simpan"}
              </button>
            </>
          }
        >
          <form id="form-ekskul" onSubmit={submit}>
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

            {allStaff.length > 0 && (
              <div className="field">
                <label className="field-label">Guru Pembina</label>
                <div style={{
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  overflow: "hidden",
                  maxHeight: 200,
                  overflowY: "auto",
                }}>
                  {allStaff.map((s, i) => (
                    <label key={s.id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 12px", cursor: "pointer",
                      borderTop: i === 0 ? "none" : "1px solid var(--line-soft)",
                      background: selectedGuru.has(s.id) ? "var(--accent-soft)" : "transparent",
                      transition: "background .1s",
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedGuru.has(s.id)}
                        onChange={() => toggleGuru(s.id)}
                        style={{ accentColor: "var(--accent)", width: 15, height: 15, flexShrink: 0 }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{s.nama}</span>
                    </label>
                  ))}
                </div>
                {selectedGuru.size > 0 && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--ink-soft)" }}>
                    {selectedGuru.size} guru dipilih
                  </p>
                )}
              </div>
            )}
          </form>
        </ModalShell>
      )}
    </>
  );
}
