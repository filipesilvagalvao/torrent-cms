"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPen,
  faTrash,
  faSpinner,
  faChevronRight,
  faCircleCheck,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

type EpisodeRow = {
  id: string;
  number: number;
  title: string;
  runtime: number | null;
  filesCount: number;
};

type SeasonRow = {
  id: string;
  number: number;
  title: string | null;
  overview: string | null;
  poster: string | null;
  releaseDate: string | null;
  episodes: EpisodeRow[];
};

type Props = {
  seriesId: string;
  seriesTitle: string;
  seriesSlug: string;
  initial: SeasonRow[];
};

type Status = { kind: "ok" | "err"; message: string } | null;

export default function SeasonsManager({
  seriesId,
  seriesTitle,
  seriesSlug,
  initial,
}: Props) {
  const router = useRouter();
  const [seasons, setSeasons] = useState<SeasonRow[]>(initial);
  const [addNumber, setAddNumber] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function createSeason(e: React.FormEvent) {
    e.preventDefault();
    const number = parseInt(addNumber, 10);
    if (!Number.isFinite(number) || number < 0) {
      setStatus({ kind: "err", message: "Informe um número válido." });
      return;
    }
    setAdding(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/series/${seriesId}/seasons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number,
          title: addTitle.trim() || null,
          overview: null,
          poster: null,
          releaseDate: null,
        }),
      });
      const json = (await res.json()) as { data?: SeasonRow; error?: string; issues?: { fieldErrors?: Record<string, string[]> } };
      if (!res.ok) {
        const extra = json.issues?.fieldErrors
          ? Object.entries(json.issues.fieldErrors)
              .map(([k, v]) => `${k}: ${(v ?? []).join(", ")}`)
              .join("; ")
          : "";
        throw new Error(json.error + (extra ? ` — ${extra}` : ""));
      }
      if (!json.data) throw new Error("Resposta vazia do servidor.");
      const created: SeasonRow = { ...json.data, episodes: [] };
      setSeasons((arr) =>
        [...arr, created].sort((a, b) => a.number - b.number),
      );
      setAddNumber("");
      setAddTitle("");
      setStatus({ kind: "ok", message: "Temporada criada." });
      router.refresh();
    } catch (e) {
      setStatus({ kind: "err", message: (e as Error).message });
    } finally {
      setAdding(false);
    }
  }

  async function deleteSeason(id: string) {
    if (!confirm("Excluir esta temporada? Todos os episódios serão removidos.")) return;
    try {
      const res = await fetch(`/api/admin/seasons/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        throw new Error(j.error ?? "Erro");
      }
      setSeasons((arr) => arr.filter((s) => s.id !== id));
      router.refresh();
    } catch (e) {
      setStatus({ kind: "err", message: (e as Error).message });
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div
        style={{
          background: "var(--bg-color-2)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "1rem 1.25rem",
        }}
      >
        <strong style={{ color: "var(--text-color-1)" }}>{seriesTitle}</strong>
        <p style={{ color: "var(--light-text)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
          /series/{seriesSlug}
        </p>
        <Link
          href={`/admin/series/${seriesId}/editar`}
          style={{ display: "inline-block", marginTop: "0.75rem", color: "var(--main-color)" }}
        >
          ← Voltar para informações da série
        </Link>
      </div>

      <form
        onSubmit={createSeason}
        style={{
          background: "var(--bg-color-2)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          display: "grid",
          gridTemplateColumns: "120px 1fr auto",
          gap: "0.75rem",
          alignItems: "flex-end",
        }}
      >
        <label style={fieldStyle}>
          <span style={labelStyle}>Número *</span>
          <input
            type="number"
            min={0}
            value={addNumber}
            onChange={(e) => setAddNumber(e.target.value)}
            required
            style={inputStyle}
            placeholder="1"
          />
        </label>
        <label style={fieldStyle}>
          <span style={labelStyle}>Título (opcional)</span>
          <input
            type="text"
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            style={inputStyle}
            placeholder="Temporada 1"
          />
        </label>
        <button type="submit" className="btn btn--primary" disabled={adding}>
          {adding ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            <FontAwesomeIcon icon={faPlus} />
          )}
          Adicionar temporada
        </button>
      </form>

      {status ? (
        <div
          className="alert"
          style={{
            borderColor: status.kind === "ok" ? "var(--main-color)" : "#d9534f",
            color: status.kind === "ok" ? "var(--main-color)" : "#ff8a85",
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <FontAwesomeIcon
            icon={status.kind === "ok" ? faCircleCheck : faTriangleExclamation}
          />
          {status.message}
        </div>
      ) : null}

      {seasons.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhuma temporada</h3>
          <p>Adicione a primeira temporada usando o formulário acima.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {seasons.map((s) => (
            <div
              key={s.id}
              style={{
                background: "var(--bg-color-2)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <span className="pill">Temporada {s.number}</span>
                  {s.title ? (
                    <strong style={{ marginLeft: "0.5rem", color: "var(--text-color-1)" }}>
                      {s.title}
                    </strong>
                  ) : null}
                  <p style={{ color: "var(--light-text)", margin: "0.35rem 0 0", fontSize: "0.85rem" }}>
                    {s.episodes.length} episódio(s) ·{" "}
                    {s.episodes.reduce((acc, e) => acc + e.filesCount, 0)} arquivo(s)
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link
                    href={`/admin/seasons/${s.id}/editar`}
                    className="btn btn--ghost"
                  >
                    <FontAwesomeIcon icon={faPen} /> Editar
                  </Link>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => deleteSeason(s.id)}
                    style={{ color: "#ff8a85" }}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Excluir
                  </button>
                </div>
              </div>
              {s.episodes.length > 0 ? (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                  }}
                >
                  {s.episodes.map((ep) => (
                    <li
                      key={ep.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "var(--bg-color-1)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-sm)",
                        padding: "0.65rem 0.85rem",
                      }}
                    >
                      <span style={{ color: "var(--text-color-1)" }}>
                        <strong>E{ep.number}</strong> · {ep.title}
                      </span>
                      <Link
                        href={`/admin/episodes/${ep.id}/editar`}
                        className="btn btn--ghost"
                      >
                        <FontAwesomeIcon icon={faChevronRight} />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "var(--light-text)", margin: 0, fontSize: "0.85rem" }}>
                  Nenhum episódio cadastrado.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 2 };
const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--light-text)",
};
const inputStyle: React.CSSProperties = {
  background: "var(--bg-color-1)",
  border: "1px solid var(--border-color)",
  borderRadius: "var(--radius-sm)",
  padding: "0.5rem 0.75rem",
  color: "var(--text-color-1)",
  width: "100%",
};
