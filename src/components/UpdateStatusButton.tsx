"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSiswaStatusAction } from "@/app/actions";
import { toast } from "./Toaster";

type Status = "AKTIF" | "LULUS" | "PINDAH";

const LABEL: Record<Status, string> = {
  AKTIF: "Aktif",
  LULUS: "Lulus",
  PINDAH: "Pindah",
};

export function UpdateStatusButton({ id, current }: { id: string; current: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function set(s: Status) {
    if (s === current) return;
    start(async () => {
      const res = await updateSiswaStatusAction(id, s);
      if (res.ok) { toast(`Status diubah ke ${LABEL[s]}.`); router.refresh(); }
      else toast(res.error, "bad");
    });
  }

  return (
    <div className="status-switcher">
      {(["AKTIF", "LULUS", "PINDAH"] as Status[]).map(s => (
        <button
          key={s}
          className={"status-btn" + (current === s ? " status-btn--active status-btn--" + s.toLowerCase() : "")}
          onClick={() => set(s)}
          disabled={pending}
        >
          {LABEL[s]}
        </button>
      ))}
    </div>
  );
}
