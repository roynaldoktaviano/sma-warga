"use client";

import { useRouter, usePathname } from "next/navigation";

export function PresensiDatePicker({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <input
      type="date"
      className="input"
      value={value}
      style={{ maxWidth: 180 }}
      onChange={e => {
        if (e.target.value) router.push(`${pathname}?tanggal=${e.target.value}`);
      }}
    />
  );
}
