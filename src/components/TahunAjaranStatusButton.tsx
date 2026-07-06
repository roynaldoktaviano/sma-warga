"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTahunAjaranStatusAction } from "@/app/actions";
import { toast } from "./Toaster";

type TaStatus = "PERSIAPAN" | "BERJALAN" | "SELESAI";

const NEXT: Record<TaStatus, { next: TaStatus; label: string } | null> = {
  PERSIAPAN: { next: "BERJALAN", label: "Mulai" },
  BERJALAN:  { next: "SELESAI",  label: "Selesaikan" },
  SELESAI:   null,
};

export function TahunAjaranStatusButton({ id, status }: { id: string; status: TaStatus }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const next = NEXT[status];
  if (!next) return null;

  function advance() {
    start(async () => {
      const res = await updateTahunAjaranStatusAction(id, next!.next);
      if (res.ok) {
        toast(`Status diubah ke ${next!.next}.`);
        router.refresh();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  return (
    <button className="btn btn-sm" disabled={pending} onClick={advance}>
      {pending ? "…" : next.label}
    </button>
  );
}
