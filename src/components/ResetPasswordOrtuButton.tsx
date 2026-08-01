"use client";

import { useTransition } from "react";
import { resetPasswordOrtuAction } from "@/app/actions";
import { toast } from "./Toaster";

export function ResetPasswordOrtuButton() {
  const [pending, start] = useTransition();

  function handle() {
    if (!confirm("Reset password SEMUA orang tua/wali ke NIS anak masing-masing?\n\nOrang tua yang sudah ubah password sendiri juga akan ter-reset.")) return;
    start(async () => {
      const res = await resetPasswordOrtuAction();
      if (res.ok) toast(`Password ${res.count} orang tua berhasil direset ke NIS.`);
      else toast(res.error ?? "Gagal reset password.", "bad");
    });
  }

  return (
    <button className="btn btn-danger" onClick={handle} disabled={pending} style={{ borderColor: "var(--bad)", color: "var(--bad)" }}>
      {pending ? "Mereset…" : "Reset Password Orang Tua ke NIS"}
    </button>
  );
}
