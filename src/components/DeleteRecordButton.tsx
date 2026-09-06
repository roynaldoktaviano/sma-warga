"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteRecordAction } from "@/app/actions";
import { toast } from "./Toaster";
import { IconTrash } from "./icons";

export function DeleteRecordButton({ recordId }: { recordId: string }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (!confirm) {
    return (
      <div className="entry-del">
        <button onClick={() => setConfirm(true)} title="Hapus catatan" aria-label="Hapus catatan">
          <IconTrash />
        </button>
      </div>
    );
  }

  return (
    <div className="entry-del entry-del--confirm">
      <div className="confirm-delete">
        <span>Hapus catatan ini? Poin siswa akan disesuaikan.</span>
        <div className="confirm-actions">
          <button className="btn btn-sm" onClick={() => setConfirm(false)}>Batal</button>
          <button
            className="btn btn-sm btn-danger"
            disabled={pending}
            onClick={() => {
              start(async () => {
                const res = await deleteRecordAction(recordId);
                if (res.ok) {
                  toast("Catatan dihapus.");
                  router.refresh();
                } else {
                  toast(res.error, "bad");
                  setConfirm(false);
                }
              });
            }}
          >
            {pending ? "Menghapus…" : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
