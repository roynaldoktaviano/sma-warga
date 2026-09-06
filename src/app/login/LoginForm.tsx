"use client";

import { useState, useTransition } from "react";
import { loginAction } from "./actions";
import { IconWarn } from "@/components/icons";

export function LoginForm() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    start(async () => {
      const res = await loginAction(u, p);
      if (res && "error" in res) setErr(res.error);
    });
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2>Masuk</h2>
      <p className="lead">Gunakan akun yang diberikan sekolah.</p>

      {err ? (
        <div className="auth-error show" role="alert">
          <IconWarn />
          <span>{err}</span>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="lu">Username / NISN</label>
        <input id="lu" name="username" type="text" autoComplete="username" placeholder="Username, NISN siswa, atau ortu-NISN" value={u} onChange={(e) => setU(e.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="lp">Kata sandi</label>
        <input id="lp" name="password" type="password" autoComplete="current-password" placeholder="••••••••" value={p} onChange={(e) => setP(e.target.value)} required />
      </div>
      <button type="submit" className="btn btn-accent btn-block" disabled={pending}>
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
