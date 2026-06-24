"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteStudentAction } from "@/app/actions";
import { toast } from "./Toaster";
import { IconTrash } from "./icons";

export function DeleteStudentButton({ id, nama }: { id: string; nama: string }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (!confirm) {
    return (
      <button className="btn btn-danger" onClick={() => setConfirm(true)}>
        <IconTrash />
        Hapus Siswa
      </button>
    );
  }

  return (
    <div className="confirm-delete">
      <span>Hapus <b>{nama}</b>? Semua data tatib, presensi, dan prestasi ikut terhapus.</span>
      <div className="confirm-actions">
        <button className="btn" onClick={() => setConfirm(false)}>Batal</button>
        <button
          className="btn btn-danger"
          disabled={pending}
          onClick={() => {
            start(async () => {
              const res = await deleteStudentAction(id);
              if (res.ok) {
                toast("Siswa berhasil dihapus.");
                router.push("/dashboard");
              } else {
                toast(res.error, "bad");
                setConfirm(false);
              }
            });
          }}
        >
          {pending ? "Menghapus…" : "Ya, Hapus"}
        </button>
      </div>
    </div>
  );
}
