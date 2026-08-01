"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setIzinGantiPasswordSiswaAction } from "@/app/actions";
import { toast } from "./Toaster";

export function IzinGantiPasswordToggle({ enabled }: { enabled: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function toggle() {
    const next = !enabled;
    start(async () => {
      const res = await setIzinGantiPasswordSiswaAction(next);
      if (res.ok) {
        toast(next ? "Siswa & orang tua kini bisa ganti password sendiri." : "Ganti password siswa & orang tua dinonaktifkan.");
        router.refresh();
      } else {
        toast(res.error, "bad");
      }
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={toggle}
      disabled={pending}
      className="btn"
      style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        borderColor: enabled ? "var(--good)" : "var(--line)",
        color: enabled ? "var(--good)" : "var(--ink-soft)",
        background: enabled ? "var(--good-bg)" : "var(--surface)",
      }}
    >
      <span style={{
        width: 34, height: 19, borderRadius: 999, position: "relative", flex: "none",
        background: enabled ? "var(--good)" : "var(--line)", transition: "background .15s",
      }}>
        <span style={{
          position: "absolute", top: 2, left: enabled ? 17 : 2,
          width: 15, height: 15, borderRadius: "50%", background: "#fff",
          transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,.25)",
        }} />
      </span>
      {pending ? "Menyimpan…" : enabled ? "Aktif" : "Nonaktif"}
    </button>
  );
}
