"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { loginUser, registerUser } from "@/entities/user/model/auth-storage";
import type { UserAccount } from "@/shared/types/auth";

interface AuthPanelProps {
  onAuthenticated: (user: UserAccount) => void;
}

type Mode = "login" | "register";

export const AuthPanel = ({ onAuthenticated }: AuthPanelProps) => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || password.length < 4) {
      setError("Введите email и пароль не короче 4 символов.");
      return;
    }

    const result = mode === "login" ? loginUser(email, password) : registerUser(email, password);

    if (result.error || !result.user) {
      setError(result.error ?? "Ошибка авторизации.");
      return;
    }

    onAuthenticated(result.user);
  };

  return (
    <section className="auth-panel">
      <h1>Trading Discipline Calendar</h1>
      <p className="subtitle">Войди в аккаунт, чтобы вести персональный календарь дисциплины.</p>

      <div className="auth-tabs">
        <button
          type="button"
          className={mode === "login" ? "auth-tabs__active" : ""}
          onClick={() => setMode("login")}
        >
          Логин
        </button>
        <button
          type="button"
          className={mode === "register" ? "auth-tabs__active" : ""}
          onClick={() => setMode("register")}
        >
          Регистрация
        </button>
      </div>

      <form className="form" onSubmit={submit}>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={4}
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit">{mode === "login" ? "Войти" : "Создать аккаунт"}</button>
      </form>
    </section>
  );
};
