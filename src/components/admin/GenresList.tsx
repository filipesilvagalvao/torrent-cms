"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faPen,
  faPlus,
  faSpinner,
  faTrash,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

type GenreRow = {
  id: string;
  name: string;
  slug: string;
  moviesCount: number;
  seriesCount: number;
};

type Props = {
  initial: GenreRow[];
};

type Status = "idle" | "saving" | "deleting";

export default function GenresList({ initial }: Props) {
  const router = useRouter();
  const [genres, setGenres] = useState<GenreRow[]>(initial);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  function autoSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/admin/genres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() || autoSlug(name) }),
      });
      const json = (await res.json()) as { data?: GenreRow; error?: string; issues?: { fieldErrors?: Record<string, string[]> } };
      if (!res.ok) {
        const messages = json.issues?.fieldErrors
          ? Object.entries(json.issues.fieldErrors)
              .map(([k, v]) => `${k}: ${v?.join(", ")}`)
              .join("; ")
          : "";
        throw new Error(json.error + (messages ? ` — ${messages}` : ""));
      }
      if (!json.data) throw new Error("Resposta vazia");
      setGenres((arr) =>
        [...arr, { ...json.data!, moviesCount: 0, seriesCount: 0 }].sort(
          (a, b) => a.name.localeCompare(b.name),
        ),
      );
      setName("");
      setSlug("");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStatus("idle");
    }
  }

  async function save(id: string) {
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch(`/api/admin/genres/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), slug: editSlug.trim() || autoSlug(editName) }),
      });
      const json = (await res.json()) as { data?: GenreRow; error?: string; issues?: { fieldErrors?: Record<string, string[]> } };
      if (!res.ok) throw new Error(json.error ?? "Erro");
      setGenres((arr) =>
        arr.map((g) =>
          g.id === id
            ? { ...g, name: editName.trim(), slug: json.data?.slug ?? g.slug, moviesCount: g.moviesCount, seriesCount: g.seriesCount }
            : g,
        ),
      );
      setEditingId(null);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStatus("idle");
    }
  }

  async function remove(id: string) {
    if (!confirm("Excluir este gênero? Filmes e séries associados serão desvinculados.")) return;
    setStatus("deleting");
    setError(null);
    try {
      const res = await fetch(`/api/admin/genres/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Erro");
      }
      setGenres((arr) => arr.filter((g) => g.id !== id));
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStatus("idle");
    }
  }

  function startEdit(g: GenreRow) {
    setEditingId(g.id);
    setEditName(g.name);
    setEditSlug(g.slug);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <form
        onSubmit={create}
        style={{
          background: "var(--bg-color-2)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          display: "grid",
          gap: "0.75rem",
          gridTemplateColumns: "2fr 2fr auto",
        }}
      >
        <label style={fieldStyle}>
          <span style={labelStyle}>Nome *</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
            placeholder="Ex: Ação"
          />
        </label>
        <label style={fieldStyle}>
          <span style={labelStyle}>Slug (opcional)</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            style={inputStyle}
            placeholder="acao"
          />
        </label>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={status === "saving"}
          >
            {status === "saving" ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faPlus} />
            )}
            Adicionar
          </button>
        </div>
      </form>

      {error ? (
        <div
          className="alert"
          style={{ borderColor: "#d9534f", color: "#ff8a85", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <FontAwesomeIcon icon={faTriangleExclamation} />
          {error}
        </div>
      ) : null}

      <div
        style={{
          background: "var(--bg-color-2)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-color-1)" }}>
              <th style={th}>Nome</th>
              <th style={th}>Slug</th>
              <th style={th}>Filmes</th>
              <th style={th}>Séries</th>
              <th style={th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {genres.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: "1.5rem", textAlign: "center", color: "var(--light-text)" }}
                >
                  Nenhum gênero cadastrado.
                </td>
              </tr>
            ) : (
              genres.map((g) => (
                <tr key={g.id} style={{ borderTop: "1px solid var(--border-color)" }}>
                  <td style={td}>
                    {editingId === g.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={inputStyle}
                      />
                    ) : (
                      <strong style={{ color: "var(--text-color-1)" }}>{g.name}</strong>
                    )}
                  </td>
                  <td style={td}>
                    {editingId === g.id ? (
                      <input
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        style={inputStyle}
                      />
                    ) : (
                      <code style={{ color: "var(--light-text)" }}>{g.slug}</code>
                    )}
                  </td>
                  <td style={td}>{g.moviesCount}</td>
                  <td style={td}>{g.seriesCount}</td>
                  <td style={td}>
                    {editingId === g.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => save(g.id)}
                          className="btn btn--primary"
                          style={{ padding: "0.35rem 0.75rem" }}
                        >
                          <FontAwesomeIcon icon={faCheck} /> Salvar
                        </button>{" "}
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="btn btn--ghost"
                          style={{ padding: "0.35rem 0.75rem" }}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(g)}
                          className="btn btn--ghost"
                          style={{ padding: "0.35rem 0.75rem" }}
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>{" "}
                        <button
                          type="button"
                          onClick={() => remove(g.id)}
                          className="btn btn--ghost"
                          style={{ padding: "0.35rem 0.75rem", color: "#ff8a85" }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "0.7rem 0.85rem",
  textAlign: "left",
  color: "var(--light-text)",
  fontWeight: 600,
  fontSize: "0.8rem",
  textTransform: "uppercase",
};
const td: React.CSSProperties = { padding: "0.7rem 0.85rem", verticalAlign: "middle" };
const inputStyle: React.CSSProperties = {
  background: "var(--bg-color-1)",
  border: "1px solid var(--border-color)",
  borderRadius: "var(--radius-sm)",
  padding: "0.5rem 0.75rem",
  color: "var(--text-color-1)",
  width: "100%",
};
const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--light-text)",
  marginBottom: 2,
};
const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 0,
};
