"use client";

import { useState, useTransition } from "react";
import { deleteKelasAction } from "@/app/actions";
import { toast } from "./Toaster";
import { IconTrash } from "./icons";

export function DeleteKelasButton({ id, nama }: { id: string; nama: string }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();

  function run() {
    start(async () => {
      const res = await deleteKelasAction(id);
      if (res.ok) toast(`Kelas "${nama}" dihapus.`);
      else toast(res.error, "bad");
      setConfirm(false);
    });
  }

  if (!confirm) {
    return (
      <button className="btn-icon-del" title="Hapus kelas" onClick={() => setConfirm(true)}>
        <IconTrash />
      </button>
    );
  }

  return (
    <div className="confirm-delete">
      <span>Hapus kelas &ldquo;{nama}&rdquo; dan semua anggotanya?</span>
      <div className="confirm-actions">
        <button className="btn btn-sm btn-danger" onClick={run} disabled={pending}>
          {pending ? "..." : "Hapus"}
        </button>
        <button className="btn btn-sm" onClick={() => setConfirm(false)}>Batal</button>
      </div>
    </div>
  );
}
