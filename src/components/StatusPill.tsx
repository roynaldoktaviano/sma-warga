import { statusOf } from "@/lib/points";

export function StatusPill({ points }: { points: number }) {
  const st = statusOf(points);
  return (
    <span className="pill" style={{ background: st.bg, color: st.color }}>
      <span className="pill-dot" style={{ background: st.color }} />
      {st.label}
    </span>
  );
}
