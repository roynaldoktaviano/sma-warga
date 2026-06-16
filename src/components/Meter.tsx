import { METER_MAX } from "@/lib/points";

const SEGS = [
  { w: 70, c: "var(--bad-bg)" }, // 0-70
  { w: 15, c: "var(--warn-bg)" }, // 70-85
  { w: 15, c: "var(--info-bg)" }, // 85-100
  { w: 50, c: "var(--good-bg)" }, // 100-150
];

export function Meter({ points }: { points: number }) {
  const clamped = Math.max(0, Math.min(METER_MAX, points));
  const left = (clamped / METER_MAX) * 100;
  return (
    <div className="meter">
      <div className="meter-track">
        <div className="meter-fill">
          {SEGS.map((s, i) => (
            <div
              key={i}
              className="meter-seg"
              style={{ width: `${(s.w / METER_MAX) * 100}%`, background: s.c }}
            />
          ))}
        </div>
        <div className="meter-marker" style={{ left: `${left}%` }}>
          <div className="meter-pin" />
        </div>
      </div>
      <div className="meter-scale">
        <span>0</span>
        <span>70</span>
        <span>85</span>
        <span>100</span>
        <span>150</span>
      </div>
      <div className="meter-legend">
        <span><i className="pill-dot" style={{ background: "var(--bad)" }} />&lt;70 Pembinaan</span>
        <span><i className="pill-dot" style={{ background: "var(--warn)" }} />70–84 Perhatian</span>
        <span><i className="pill-dot" style={{ background: "var(--info)" }} />85–99 Baik</span>
        <span><i className="pill-dot" style={{ background: "var(--good)" }} />100+ Teladan</span>
      </div>
    </div>
  );
}
