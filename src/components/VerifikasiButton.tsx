"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifikasiCatatanAction } from "@/app/actions";
import { toast } from "./Toaster";
import { IconCheck, IconX } from "./icons";

export function VerifikasiButton({ catatanId, role }: { catatanId: string; role: string }) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();

  function act(aksi: "verifikasi" | "tolak") {
    start(async () => {
      const res = await verifikasiCatatanAction(catatanId, aksi);
      if (res.ok) {
        toast(aksi === "verifikasi" ? "Catatan diverifikasi." : "Catatan ditolak.");
        setConfirm(false);
        router.refresh();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  if (!confirm) {
    return (
      <button
        className="btn btn-sm"
        style={{ fontSize: 11, padding: "4px 8px" }}
        onClick={() => setConfirm(true)}
        disabled={pending}
      >
        Verifikasi
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 4 }}>
      <button
        className="btn btn-sm btn-accent"
        style={{ padding: "4px 8px" }}
        onClick={() => act("verifikasi")}
        disabled={pending}
        title="Setujui"
      >
        <IconCheck />
      </button>
      <button
        className="btn btn-sm btn-danger"
        style={{ padding: "4px 8px" }}
        onClick={() => act("tolak")}
        disabled={pending}
        title="Tolak"
      >
        <IconX />
      </button>
    </div>
  );
}
