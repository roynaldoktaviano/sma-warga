"use client";

import { useTransition } from "react";
import { resetPasswordSiswaAction } from "@/app/actions";
import { toast } from "./Toaster";

export function ResetPasswordSiswaButton() {
  const [pending, start] = useTransition();

  function handle() {
    if (!confirm("Reset password SEMUA siswa ke NIS masing-masing?\n\nSiswa yang sudah ubah password sendiri juga akan ter-reset.")) return;
    start(async () => {
      const res = await resetPasswordSiswaAction();
      if (res.ok) toast(`Password ${res.count} siswa berhasil direset ke NIS.`);
      else toast(res.error ?? "Gagal reset password.", "bad");
    });
  }

  return (
    <button className="btn btn-danger" onClick={handle} disabled={pending} style={{ borderColor: "var(--bad)", color: "var(--bad)" }}>
      {pending ? "Mereset…" : "Reset Password Siswa ke NIS"}
    </button>
  );
}
