"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (!res) {
        setError("Sem resposta do servidor.");
        setLoading(false);
        return;
      }
      if (res.error) {
        setError("E-mail ou senha inválidos.");
        setLoading(false);
        return;
      }
      const target = search.get("callbackUrl") ?? "/admin";
      router.push(target);
      router.refresh();
    } catch (e) {
      setError((e as Error).message ?? "Falha no login");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
      }}
    >
      {error ? (
        <div
          className="alert"
          style={{
            borderColor: "#d9534f",
            color: "#ff8a85",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FontAwesomeIcon icon={faTriangleExclamation} />
          {error}
        </div>
      ) : null}

      <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--light-text)" }}>
          E-mail
        </span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          placeholder="admin@playcinix.local"
        />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--light-text)" }}>
          Senha
        </span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
      </label>

      <button
        type="submit"
        className="btn btn--primary btn--block"
        disabled={loading}
      >
        {loading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </button>

      <p
        style={{
          color: "var(--light-text)",
          fontSize: "0.75rem",
          margin: 0,
          textAlign: "center",
        }}
      >
        Usuário padrão: <code>admin@playcinix.local</code> / senha{" "}
        <code>admin123</code>
      </p>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--bg-color-1)",
  border: "1px solid var(--border-color)",
  borderRadius: "var(--radius-sm)",
  padding: "0.65rem 0.85rem",
  color: "var(--text-color-1)",
  fontSize: "0.95rem",
  width: "100%",
};
