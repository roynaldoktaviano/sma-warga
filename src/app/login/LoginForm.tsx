"use client";

import { useState, useTransition } from "react";
import { loginAction } from "./actions";
import { IconWarn } from "@/components/icons";

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
        <label htmlFor="lu">Username / NISN</label>
        <input id="lu" type="text" autoComplete="username" placeholder="Username, NISN siswa, atau ortu-NISN" value={u} onChange={(e) => setU(e.target.value)} onKeyDown={onKey} />
      </div>
      <div className="field">
        <label htmlFor="lp">Kata sandi</label>
        <input id="lp" type="password" autoComplete="current-password" placeholder="••••••••" value={p} onChange={(e) => setP(e.target.value)} onKeyDown={onKey} />
      </div>
      <button className="btn btn-accent btn-block" onClick={submit} disabled={pending}>
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </div>
  );
}
