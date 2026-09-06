"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteStaffAction } from "@/app/actions";
import { toast } from "./Toaster";
import { IconTrash } from "./icons";

export function DeleteStaffButton({ id, isSelf }: { id: string; isSelf: boolean }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (isSelf) return <span className="staff-self-badge">Akun Anda</span>;

  if (!confirm) {
    return (
      <button className="btn-icon-del" title="Hapus akun" onClick={() => setConfirm(true)}>
        <IconTrash />
      </button>
    );
  }

  return (
    <div className="confirm-delete">
      <span>Hapus akun ini? Tindakan tidak bisa dibatalkan.</span>
      <div className="confirm-actions">
        <button className="btn" onClick={() => setConfirm(false)}>Batal</button>
        <button
          className="btn btn-danger"
          disabled={pending}
          onClick={() => {
            start(async () => {
              const res = await deleteStaffAction(id);
              if (res.ok) { toast("Akun dihapus."); router.refresh(); }
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
