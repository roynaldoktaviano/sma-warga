"use client";

import { useState, useTransition } from "react";
import { setActiveTahunAjaranAction } from "@/app/actions";
import { toast } from "./Toaster";

export function SetActiveTahunAjaranButton({ id, nama }: { id: string; nama: string }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();

  function run() {
    start(async () => {
      const res = await setActiveTahunAjaranAction(id);
      if (res.ok) {
        toast(`"${nama}" sekarang menjadi tahun ajaran aktif.`);
        setConfirm(false);
      } else {
        toast(res.error, "bad");
      }
    });
  }

  if (!confirm) {
    return (
      <button
        className="btn btn-sm"
        style={{ fontSize: 12, padding: "4px 10px" }}
        onClick={() => setConfirm(true)}
      >
        Jadikan Aktif
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      <button
        className="btn btn-sm btn-accent"
        style={{ fontSize: 12, padding: "4px 10px" }}
        onClick={run}
        disabled={pending}
      >
        {pending ? "..." : "Ya, aktifkan"}
      </button>
      <button
        className="btn btn-sm btn-ghost"
        style={{ fontSize: 12 }}
        onClick={() => setConfirm(false)}
      >
        Batal
      </button>
    </div>
  );
}
