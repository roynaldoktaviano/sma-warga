"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addEkskulGuruAction, removeEkskulGuruAction } from "@/app/actions";
import { toast } from "./Toaster";
import { ModalShell } from "./ModalShell";
import { IconSettings } from "./icons";

type StaffItem = { id: string; nama: string; role: string };
type GuruItem  = { id: string; nama: string };

export function ManageEkskulGuruButton({
  ekskulId,
  currentGuru,
  allStaff,
}: {
  ekskulId: string;
  currentGuru: GuruItem[];
  allStaff: StaffItem[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  function addGuru(staffId: string) {
    start(async () => {
      const res = await addEkskulGuruAction(ekskulId, staffId);
      if (res.ok) { toast("Guru ditambahkan."); router.refresh(); }
      else toast(res.error, "bad");
    });
  }

  function removeGuru(staffId: string) {
    start(async () => {
      const res = await removeEkskulGuruAction(ekskulId, staffId);
      if (res.ok) { toast("Guru dihapus."); router.refresh(); }
      else toast(res.error, "bad");
    });
  }

  const assignedIds = new Set(currentGuru.map(g => g.id));
  const available = allStaff.filter(s => !assignedIds.has(s.id));

  return (
    <>
      <button className="btn btn-sm btn-ghost" onClick={() => setOpen(true)}>
        <IconSettings /> Atur
      </button>

      {open && (
        <ModalShell
          title="Atur Guru Pembina"
          onClose={() => setOpen(false)}
          footer={
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>Tutup</button>
          }
        >
          {currentGuru.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="field-label" style={{ marginBottom: 8 }}>Pembina saat ini</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {currentGuru.map(g => (
                  <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface-2)", borderRadius: 8, border: "1px solid var(--line-soft)" }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{g.nama}</span>
                    <button className="btn btn-sm btn-danger" onClick={() => removeGuru(g.id)} disabled={pending}>
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {available.length > 0 && (
            <div>
              <div className="field-label" style={{ marginBottom: 8 }}>Tambah guru</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {available.map(s => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface-2)", borderRadius: 8, border: "1px solid var(--line-soft)" }}>
                    <span style={{ fontSize: 13 }}>{s.nama}</span>
                    <button className="btn btn-sm" onClick={() => addGuru(s.id)} disabled={pending}>
                      + Tambah
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {available.length === 0 && currentGuru.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--ink-faint)", margin: 0 }}>Tidak ada staf tersedia.</p>
          )}
        </ModalShell>
      )}
    </>
  );
}
