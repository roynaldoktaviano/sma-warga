"use client";

import { useState, useTransition } from "react";
import { loginAction } from "./actions";
import { IconWarn } from "@/components/icons";

const demos = [
  { label: "Kesiswaan", user: "kesiswaan", pass: "kesiswaan123" },
  { label: "BKA", user: "bka", pass: "bka123" },
  { label: "Siswa (contoh)", user: "24001", pass: "siswa123" },
];

export function LoginForm() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    setErr("");
    start(async () => {
      const res = await loginAction(u, p);
      if (res && "error" in res) setErr(res.error);
      // sukses → redirect otomatis dari server action
    });
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submit();
  }

  return (
    <div className="auth-form">
      <h2>Masuk</h2>
      <p className="lead">Gunakan akun yang diberikan sekolah.</p>

      {err ? (
        <div className="auth-error show">
          <IconWarn />
          <span>{err}</span>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="lu">Username</label>
        <input id="lu" type="text" autoComplete="username" placeholder="mis. kesiswaan" value={u} onChange={(e) => setU(e.target.value)} onKeyDown={onKey} />
      </div>
      <div className="field">
        <label htmlFor="lp">Kata sandi</label>
        <input id="lp" type="password" autoComplete="current-password" placeholder="••••••••" value={p} onChange={(e) => setP(e.target.value)} onKeyDown={onKey} />
      </div>
      <button className="btn btn-accent btn-block" onClick={submit} disabled={pending}>
        {pending ? "Memeriksa…" : "Masuk"}
      </button>

      <div className="demo">
        <div className="demo-h">Akun demo</div>
        {demos.map((d) => (
          <div className="demo-row" key={d.user}>
            <div className="demo-info">
              <b>{d.label}</b>
              <span>
                {d.user} · {d.pass}
              </span>
            </div>
            <button
              className="demo-use"
              onClick={() => {
                setU(d.user);
                setP(d.pass);
              }}
            >
              Pakai
            </button>
          </div>
        ))}
        <div className="field-hint" style={{ marginTop: 10 }}>
          Siswa login dengan <b>NIS</b> sebagai username · sandi default <b>siswa123</b>.
        </div>
      </div>
    </div>
  );
}
