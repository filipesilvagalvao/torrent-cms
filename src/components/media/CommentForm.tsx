"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCircleCheck,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  type: "movie" | "series";
  itemId: string;
};

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export default function CommentForm({ type, itemId }: Props) {
  const router = useRouter();
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          itemId,
          authorName: authorName.trim(),
          content: content.trim(),
        }),
      });
      const json = (await res.json()) as {
        data?: unknown;
        error?: string;
        issues?: { fieldErrors?: Record<string, string[]> };
      };
      if (!res.ok) {
        const msgs: string[] = [];
        if (json.issues?.fieldErrors) {
          for (const [, messages] of Object.entries(json.issues.fieldErrors)) {
            if (messages && messages.length > 0) msgs.push(...messages);
          }
        }
        throw new Error(msgs.length > 0 ? msgs.join(". ") : json.error ?? "Erro");
      }
      setStatus({
        kind: "success",
        message: "Comentário enviado com sucesso!",
      });
      setAuthorName("");
      setContent("");
      router.refresh();
    } catch (e) {
      setStatus({ kind: "error", message: (e as Error).message });
    }
  }

  return (
    <form
      onSubmit={submit}
      style={{
        background: "var(--bg-color-2)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
      }}
    >
      <strong style={{ color: "var(--text-color-1)" }}>Deixe seu comentário</strong>
      <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--light-text)" }}>
          Seu nome *
        </span>
        <input
          type="text"
          required
          minLength={2}
          maxLength={80}
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          style={inputStyle}
          placeholder="Como você quer ser identificado"
        />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--light-text)" }}>
          Comentário *
        </span>
        <textarea
          required
          minLength={3}
          maxLength={2000}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
          placeholder="Compartilhe sua opinião..."
        />
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={status.kind === "sending"}
        >
          {status.kind === "sending" ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : null}
          {status.kind === "sending" ? "Enviando..." : "Enviar comentário"}
        </button>
        {status.kind === "success" ? (
          <span
            style={{
              color: "var(--main-color)",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <FontAwesomeIcon icon={faCircleCheck} /> {status.message}
          </span>
        ) : null}
        {status.kind === "error" ? (
          <span
            style={{
              color: "#ff8a85",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <FontAwesomeIcon icon={faTriangleExclamation} /> {status.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--bg-color-1)",
  border: "1px solid var(--border-color)",
  borderRadius: "var(--radius-sm)",
  padding: "0.55rem 0.75rem",
  color: "var(--text-color-1)",
  fontSize: "0.9rem",
  width: "100%",
  fontFamily: "inherit",
};
