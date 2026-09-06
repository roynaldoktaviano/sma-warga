"use client";

import { useState, useTransition } from "react";
import { resetPasswordSiswaAction } from "@/app/actions";
import { toast } from "./Toaster";

export function ResetPasswordSiswaButton() {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();

  if (!confirm) {
    return (
      <button
        className="btn btn-danger"
        onClick={() => setConfirm(true)}
        style={{ borderColor: "var(--bad)", color: "var(--bad)" }}
      >
        Reset Password Siswa ke NIS
      </button>
    );
  }

  return (
    <div className="confirm-delete">
      <span>
        Reset password <b>SEMUA</b> siswa ke NIS masing-masing? Siswa yang sudah ubah password sendiri
        juga akan <b>ter-reset</b>.
      </span>
      <div className="confirm-actions">
        <button className="btn" onClick={() => setConfirm(false)}>Batal</button>
        <button
          className="btn btn-danger"
          disabled={pending}
          onClick={() => {
            start(async () => {
              const res = await resetPasswordSiswaAction();
              if (res.ok) toast(`Password ${res.count} siswa berhasil direset ke NIS.`);
              else toast(res.error ?? "Gagal reset password.", "bad");
              setConfirm(false);
            });
          }}
        >
          {pending ? "Mereset…" : "Ya, Reset Password"}
        </button>
      </div>
    </div>
  );
}
