"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetPoinSiswaAction } from "@/app/actions";
import { toast } from "./Toaster";

export function ResetPoinSiswaButton() {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (!confirm) {
    return (
      <button
        className="btn btn-danger"
        onClick={() => setConfirm(true)}
        style={{ borderColor: "var(--bad)", color: "var(--bad)" }}
      >
        Reset Poin Semua Siswa
      </button>
    );
  }

  return (
    <div className="confirm-delete">
      <span>
        Reset poin <b>SEMUA</b> siswa ke 100? Seluruh riwayat catatan pelanggaran &amp; prestasi akan{" "}
        <b>terhapus permanen</b> dan tidak bisa dikembalikan.
      </span>
      <div className="confirm-actions">
        <button className="btn" onClick={() => setConfirm(false)}>Batal</button>
        <button
          className="btn btn-danger"
          disabled={pending}
          onClick={() => {
            start(async () => {
              const res = await resetPoinSiswaAction();
              if (res.ok) {
                toast(`Poin semua siswa direset ke 100 (${res.count} catatan dihapus).`);
                setConfirm(false);
                router.refresh();
              } else {
                toast(res.error, "bad");
                setConfirm(false);
              }
            });
          }}
        >
          {pending ? "Mereset…" : "Ya, Reset Poin"}
        </button>
      </div>
    </div>
  );
}
