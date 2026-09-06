"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeEkskulAnggotaAction } from "@/app/actions";
import { toast } from "./Toaster";
import { IconX } from "./icons";

export function RemoveEkskulAnggotaButton({
  ekskulId,
  siswaId,
  namaSiswa,
}: {
  ekskulId: string;
  siswaId: string;
  namaSiswa: string;
}) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (!confirm) {
    return (
      <button
        className="btn btn-sm btn-danger"
        onClick={() => setConfirm(true)}
        style={{ padding: "3px 7px" }}
        title="Hapus anggota"
      >
        <IconX />
      </button>
    );
  }

  return (
    <div className="confirm-delete">
      <span>Hapus <b>{namaSiswa}</b> dari ekskul ini?</span>
      <div className="confirm-actions">
        <button className="btn btn-sm" onClick={() => setConfirm(false)}>Batal</button>
        <button
          className="btn btn-sm btn-danger"
          disabled={pending}
          onClick={() => {
            start(async () => {
              const res = await removeEkskulAnggotaAction(ekskulId, siswaId);
              if (res.ok) { toast("Anggota dihapus."); router.refresh(); }
              else { toast(res.error, "bad"); setConfirm(false); }
            });
          }}
        >
          {pending ? "Menghapus…" : "Ya, Hapus"}
        </button>
      </div>
    </div>
  );
}
