"use client";

import { useCallback, useEffect, useState } from "react";

type ToastItem = { id: number; msg: string; bad?: boolean };
let counter = 0;

// Helper: panggil dari komponen client mana pun
export function toast(msg: string, type?: "bad") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("lentera:toast", { detail: { msg, bad: type === "bad" } }));
}

export default function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const remove = useCallback((id: number) => setItems((s) => s.filter((t) => t.id !== id)), []);

  useEffect(() => {
    function onToast(e: Event) {
      const d = (e as CustomEvent).detail as { msg: string; bad?: boolean };
      const id = ++counter;
      setItems((s) => [...s, { id, msg: d.msg, bad: d.bad }]);
      setTimeout(() => remove(id), 2900);
    }
    window.addEventListener("lentera:toast", onToast as EventListener);
    return () => window.removeEventListener("lentera:toast", onToast as EventListener);
  }, [remove]);

  return (
    <div id="toast-root">
      {items.map((t) => (
        <div key={t.id} className={"toast" + (t.bad ? " bad" : "")}>
          <span className="tdot" />
          {t.msg}
        </div>
      ))}
    </div>
  );
}
