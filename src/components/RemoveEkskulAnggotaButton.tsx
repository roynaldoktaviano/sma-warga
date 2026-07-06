"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeEkskulAnggotaAction } from "@/app/actions";
import { toast } from "./Toaster";
import { IconX } from "./icons";

export function RemoveEkskulAnggotaButton({
  ekskulId,
  siswaId,
  namaSiswa,
}: {
  ekskulId: string;
  siswaId: string;
  namaSiswa: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function remove() {
    if (!confirm(`Hapus ${namaSiswa} dari ekskul ini?`)) return;
    start(async () => {
      const res = await removeEkskulAnggotaAction(ekskulId, siswaId);
      if (res.ok) { toast("Anggota dihapus."); router.refresh(); }
      else toast(res.error, "bad");
    });
  }

  return (
    <button
      className="btn btn-sm btn-danger"
      onClick={remove}
      disabled={pending}
      style={{ padding: "3px 7px" }}
      title="Hapus anggota"
    >
      <IconX />
    </button>
  );
}
