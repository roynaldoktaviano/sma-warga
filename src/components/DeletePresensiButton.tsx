"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePresensiAction } from "@/app/actions";
import { toast } from "./Toaster";
import { IconTrash } from "./icons";

export function DeletePresensiButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <button
      className="btn-icon-del"
      disabled={pending}
      onClick={() => {
        start(async () => {
          const res = await deletePresensiAction(id);
          if (res.ok) { toast("Presensi dihapus."); router.refresh(); }
          else toast(res.error, "bad");
        });
      }}
    >
      <IconTrash />
    </button>
  );
}
