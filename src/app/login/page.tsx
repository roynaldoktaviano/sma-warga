import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="auth">
      <div className="auth-brand">
        <div className="auth-glow" />
        <div className="auth-brand-top">
          <div className="crest crest-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-sma-warga.png" alt="SMP Warga Surakarta" />
          </div>
          <b>SMP Warga Surakarta</b>
        </div>
        <div className="auth-pitch">
          <h1>Menerangi perjalanan karakter setiap siswa.</h1>
          <p>
            Catat pelanggaran dan prestasi secara adil, pantau poin tiap siswa, dan beri orang tua
            jendela untuk ikut mendampingi.
          </p>
        </div>
        <div className="auth-foot">Sistem Poin &amp; Karakter Siswa · SMP Warga Surakarta</div>
      </div>
      <div className="auth-form-wrap">
        <LoginForm />
      </div>
    </div>
  );
}
