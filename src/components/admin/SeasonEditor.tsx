"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faPlus,
  faTrash,
  faArrowLeft,
  faSpinner,
  faChevronRight,
  faCircleCheck,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

type Episode = { id: string; number: number; title: string; runtime: number | null };

type Season = {
  id: string;
  number: number;
  title: string | null;
  overview: string | null;
  poster: string | null;
  releaseDate: string | null;
  episodes: Episode[];
};

type Props = { season: Season };

type Status = { kind: "ok" | "err"; message: string } | null;

export default function SeasonEditor({ season }: Props) {
  const router = useRouter();
  const [data, setData] = useState({
    number: season.number,
    title: season.title ?? "",
    overview: season.overview ?? "",
    poster: season.poster ?? "",
    releaseDate: season.releaseDate ?? "",
  });
  const [episodes, setEpisodes] = useState<Episode[]>(season.episodes);
  const [saving, setSaving] = useState(false);
  const [busyEpisode, setBusyEpisode] = useState(false);
  const [newEp, setNewEp] = useState({ number: "", title: "" });
  const [status, setStatus] = useState<Status>(null);

  function update<K extends keyof typeof data>(key: K, value: (typeof data)[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/seasons/${season.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: parseInt(String(data.number), 10) || 0,
          title: data.title.trim() || null,
          overview: data.overview.trim() || null,
          poster: data.poster.trim() || null,
          releaseDate: data.releaseDate || null,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Erro");
      setStatus({ kind: "ok", message: "Temporada salva." });
      router.refresh();
    } catch (e) {
      setStatus({ kind: "err", message: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function addEpisode(e: React.FormEvent) {
    e.preventDefault();
    const number = parseInt(newEp.number, 10);
    if (!Number.isFinite(number) || number < 0) {
      setStatus({ kind: "err", message: "Número do episódio inválido." });
      return;
    }
    if (!newEp.title.trim()) {
      setStatus({ kind: "err", message: "Informe o título do episódio." });
      return;
    }
    setBusyEpisode(true);
    try {
      const res = await fetch(`/api/admin/seasons/${season.id}/episodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number,
          title: newEp.title.trim(),
          overview: null,
          runtime: null,
          airDate: null,
          stillImage: null,
          files: [],
        }),
      });
      const json = (await res.json()) as {
        data?: Episode;
        error?: string;
        issues?: { fieldErrors?: Record<string, string[]> };
      };
      if (!res.ok) {
        const extra = json.issues?.fieldErrors
          ? Object.entries(json.issues.fieldErrors)
              .map(([k, v]) => `${k}: ${(v ?? []).join(", ")}`)
              .join("; ")
          : "";
        throw new Error(json.error + (extra ? ` — ${extra}` : ""));
      }
      if (!json.data) throw new Error("Resposta vazia");
      setEpisodes((arr) =>
        [...arr, json.data!].sort((a, b) => a.number - b.number),
      );
      setNewEp({ number: "", title: "" });
      setStatus({ kind: "ok", message: "Episódio criado." });
      router.refresh();
    } catch (e) {
      setStatus({ kind: "err", message: (e as Error).message });
    } finally {
      setBusyEpisode(false);
    }
  }

  async function deleteEpisode(id: string) {
    if (!confirm("Excluir este episódio? Todos os arquivos dele serão removidos.")) return;
    try {
      const res = await fetch(`/api/admin/episodes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        throw new Error(j.error ?? "Erro");
      }
      setEpisodes((arr) => arr.filter((ep) => ep.id !== id));
      router.refresh();
    } catch (e) {
      setStatus({ kind: "err", message: (e as Error).message });
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Link
        href={`/admin/series/${season.id ? "" : ""}/seasons`}
        className="btn btn--ghost"
        style={{ alignSelf: "flex-start" }}
      >
        <FontAwesomeIcon icon={faArrowLeft} /> Voltar para temporadas
      </Link>

      {status ? (
        <div
          className="alert"
          style={{
            borderColor: status.kind === "ok" ? "var(--main-color)" : "#d9534f",
            color: status.kind === "ok" ? "var(--main-color)" : "#ff8a85",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FontAwesomeIcon
            icon={status.kind === "ok" ? faCircleCheck : faTriangleExclamation}
          />
          {status.message}
        </div>
      ) : null}

      <Section title="Dados da temporada">
        <form
          onSubmit={save}
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <Grid>
            <Field label="Número">
              <input
                type="number"
                min={0}
                value={data.number}
                onChange={(e) =>
                  update("number", parseInt(e.target.value, 10) || 0)
                }
                style={inputStyle}
              />
            </Field>
            <Field label="Título">
              <input
                type="text"
                value={data.title}
                onChange={(e) => update("title", e.target.value)}
                style={inputStyle}
                placeholder="Temporada 1"
              />
            </Field>
            <Field label="Lançamento">
              <input
                type="date"
                value={data.releaseDate ?? ""}
                onChange={(e) => update("releaseDate", e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Poster (URL)">
              <input
                type="url"
                value={data.poster}
                onChange={(e) => update("poster", e.target.value)}
                style={inputStyle}
                placeholder="https://..."
              />
            </Field>
          </Grid>
          <Field label="Overview">
            <textarea
              value={data.overview}
              onChange={(e) => update("overview", e.target.value)}
              style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
            />
          </Field>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={saving}
            style={{ alignSelf: "flex-start" }}
          >
            <FontAwesomeIcon icon={saving ? faSpinner : faSave} spin={saving} />
            {saving ? "Salvando..." : "Salvar temporada"}
          </button>
        </form>
      </Section>

      <Section title="Adicionar episódio">
        <form
          onSubmit={addEpisode}
          style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr auto",
            gap: "0.75rem",
            alignItems: "flex-end",
          }}
        >
          <Field label="Número">
            <input
              type="number"
              min={0}
              value={newEp.number}
              onChange={(e) =>
                setNewEp((s) => ({ ...s, number: e.target.value }))
              }
              style={inputStyle}
            />
          </Field>
          <Field label="Título">
            <input
              type="text"
              value={newEp.title}
              onChange={(e) =>
                setNewEp((s) => ({ ...s, title: e.target.value }))
              }
              style={inputStyle}
              placeholder="Nome do episódio"
            />
          </Field>
          <button type="submit" className="btn btn--primary" disabled={busyEpisode}>
            {busyEpisode ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faPlus} />
            )}
            Adicionar episódio
          </button>
        </form>
      </Section>

      <Section title={`Episódios (${episodes.length})`}>
        {episodes.length === 0 ? (
          <p style={{ color: "var(--light-text)", margin: 0 }}>
            Nenhum episódio cadastrado.
          </p>
        ) : (
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
            {episodes.map((ep) => (
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
                  {ep.runtime ? (
                    <span style={{ color: "var(--light-text)", marginLeft: "0.5rem" }}>
                      · {ep.runtime} min
                    </span>
                  ) : null}
                </span>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <Link
                    href={`/admin/episodes/${ep.id}/editar`}
                    className="btn btn--ghost"
                    title="Editar episódio"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </Link>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => deleteEpisode(ep.id)}
                    style={{ color: "#ff8a85" }}
                    title="Excluir"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "var(--bg-color-2)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <h3 style={{ fontSize: "1.05rem" }}>{title}</h3>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "0.75rem",
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <span style={{ fontSize: "0.8rem", color: "var(--light-text)" }}>{label}</span>
      {children}
    </label>
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
};
