"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowDown,
  faSpinner,
  faCircleCheck,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import type {
  ImportedMovie,
  ImportedSeries,
} from "../../services/tmdb";

type ImportedPayload = {
  type: "movie" | "series";
  movie?: ImportedMovie;
  series?: ImportedSeries;
};

type Props = {
  type: "movie" | "series";
  tmdbId: string;
  onImport: (data: ImportedPayload) => void;
  disabledWhenNoId?: boolean;
};

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export default function TmdbImportButton({
  type,
  tmdbId,
  onImport,
  disabledWhenNoId = true,
}: Props) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const disabled = disabledWhenNoId && (!tmdbId || tmdbId.trim().length === 0);

  async function handleImport() {
    const id = tmdbId.trim();
    if (!id) {
      setStatus({ kind: "error", message: "Informe o TMDB ID antes." });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/admin/tmdb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, tmdbId: id }),
      });
      const json: {
        data?: ImportedPayload;
        error?: string;
      } = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? `Erro ${res.status}`);
      }
      const data = json.data;
      if (!data) throw new Error("Resposta vazia do servidor.");
      onImport(data);
      const title = data.type === "movie" ? data.movie?.title : data.series?.title;
      setStatus({
        kind: "success",
        message: title ? `Dados de "${title}" importados.` : "Dados importados.",
      });
    } catch (e) {
      setStatus({ kind: "error", message: (e as Error).message });
    }
  }

  const button: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.55rem 1rem",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--main-color)",
    background: disabled
      ? "rgba(121, 193, 66, 0.05)"
      : "rgba(121, 193, 66, 0.15)",
    color: disabled ? "var(--light-text)" : "var(--main-color)",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600,
    fontSize: "0.9rem",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <button
        type="button"
        onClick={handleImport}
        disabled={disabled || status.kind === "loading"}
        style={button}
      >
        {status.kind === "loading" ? (
          <FontAwesomeIcon icon={faSpinner} spin />
        ) : (
          <FontAwesomeIcon icon={faCloudArrowDown} />
        )}
        Importar informações
      </button>
      {status.kind === "success" ? (
        <p
          style={{
            margin: 0,
            color: "var(--main-color)",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FontAwesomeIcon icon={faCircleCheck} />
          {status.message}
        </p>
      ) : null}
      {status.kind === "error" ? (
        <p
          style={{
            margin: 0,
            color: "#ff8a85",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FontAwesomeIcon icon={faTriangleExclamation} />
          {status.message}
        </p>
      ) : null}
      {disabled ? (
        <p style={{ margin: 0, color: "var(--light-text)", fontSize: "0.8rem" }}>
          Informe o TMDB ID acima para habilitar a importação.
        </p>
      ) : null}
    </div>
  );
}
