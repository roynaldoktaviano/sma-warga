"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteStaffAction } from "@/app/actions";
import { toast } from "./Toaster";
import { IconTrash } from "./icons";

export function DeleteStaffButton({ id, isSelf }: { id: string; isSelf: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  if (isSelf) return <span className="staff-self-badge">Akun Anda</span>;

  return (
    <button
      className="btn-icon-del"
      disabled={pending}
      title="Hapus akun"
      onClick={() => {
        if (!confirm("Hapus akun ini? Tindakan tidak bisa dibatalkan.")) return;
        start(async () => {
          const res = await deleteStaffAction(id);
          if (res.ok) { toast("Akun dihapus."); router.refresh(); }
          else toast(res.error, "bad");
        });
      }}
    >
      <IconTrash />
    </button>
  );
}
