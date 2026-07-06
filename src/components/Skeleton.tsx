export function Sk({ w, h, r }: { w?: string | number; h?: string | number; r?: string | number }) {
  return (
    <div
      className="sk"
      style={{
        width: w ?? "100%",
        height: h ?? 16,
        borderRadius: r ?? 6,
        flexShrink: 0,
      }}
    />
  );
}
