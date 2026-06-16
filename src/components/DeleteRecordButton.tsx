"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteRecordAction } from "@/app/actions";
import { toast } from "./Toaster";
import { IconTrash } from "./icons";

export function DeleteRecordButton({ recordId }: { recordId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function onDelete() {
    if (!confirm("Hapus catatan ini? Poin siswa akan disesuaikan.")) return;
    start(async () => {
      const res = await deleteRecordAction(recordId);
      if (res.ok) {
        toast("Catatan dihapus.");
        router.refresh();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  return (
    <div className="entry-del">
      <button onClick={onDelete} disabled={pending} title="Hapus catatan" aria-label="Hapus catatan">
        <IconTrash />
      </button>
    </div>
  );
}
