import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell">
      <div className="empty" style={{ marginTop: 40 }}>
        <b>Halaman tidak ditemukan</b>
        <p>Halaman yang kamu cari tidak ada atau sudah dipindahkan.</p>
        <div style={{ marginTop: 16 }}>
          <Link href="/" className="btn btn-accent" style={{ textDecoration: "none" }}>
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
