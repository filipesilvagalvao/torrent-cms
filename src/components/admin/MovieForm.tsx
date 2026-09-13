"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import GenreSelector from "./GenreSelector";
import FileEditor from "./FileEditor";
import type { FileDraft } from "./FileEditor";
import TmdbImportButton from "./TmdbImportButton";
import type {
  ImportedMovie,
  ImportedSeries,
} from "../../services/tmdb";

type Genre = { id: string; name: string };

type InitialMovie = {
  id?: string;
  tmdbId: number | null;
  title: string;
  originalTitle: string | null;
  slug: string;
  overview: string | null;
  year: number | null;
  rating: number | null;
  classification: string | null;
  poster: string | null;
  backdrop: string | null;
  trailer: string | null;
  runtime: number | null;
  languages: string | null;
  featured: boolean;
  published: boolean;
  order: number;
  genreIds: string[];
  files: FileDraft[];
};

type Props = {
  mode: "create" | "edit";
  genres: Genre[];
  initial?: InitialMovie;
};

const blank: InitialMovie = {
  tmdbId: null,
  title: "",
  originalTitle: null,
  slug: "",
  overview: null,
  year: null,
  rating: null,
  classification: null,
  poster: null,
  backdrop: null,
  trailer: null,
  runtime: null,
  languages: null,
  featured: false,
  published: false,
  order: 0,
  genreIds: [],
  files: [],
};

function applyImport(
  current: InitialMovie,
  payload:
    | { type: "movie"; movie?: ImportedMovie }
    | { type: "series"; series?: ImportedSeries },
): InitialMovie {
  if (payload.type === "movie" && payload.movie) {
    const m = payload.movie;
    return {
      ...current,
      tmdbId: m.tmdbId,
      title: m.title || current.title,
      originalTitle: m.originalTitle ?? current.originalTitle,
      overview: m.overview ?? current.overview,
      year: m.year ?? current.year,
      rating: m.rating ?? current.rating,
      runtime: m.runtime ?? current.runtime,
      languages: m.languages ?? current.languages,
      poster: m.poster ?? current.poster,
      backdrop: m.backdrop ?? current.backdrop,
    };
  }
  if (payload.type === "series" && payload.series) {
    const s = payload.series;
    return {
      ...current,
      tmdbId: s.tmdbId,
      title: s.title || current.title,
      originalTitle: s.originalTitle ?? current.originalTitle,
      overview: s.overview ?? current.overview,
      year: s.year ?? current.year,
      rating: s.rating ?? current.rating,
      runtime: s.runtime ?? current.runtime,
      languages: s.languages ?? current.languages,
      poster: s.poster ?? current.poster,
      backdrop: s.backdrop ?? current.backdrop,
    };
  }
  return current;
}

export default function MovieForm({ mode, genres, initial }: Props) {
  const router = useRouter();
  const [data, setData] = useState<InitialMovie>(initial ?? blank);
  const [genreIds, setGenreIds] = useState<string[]>(initial?.genreIds ?? []);
  const [files, setFiles] = useState<FileDraft[]>(initial?.files ?? []);
  const [tmdbIdInput, setTmdbIdInput] = useState<string>(
    initial?.tmdbId ? String(initial.tmdbId) : "",
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function update<K extends keyof InitialMovie>(key: K, value: InitialMovie[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function onImported(payload: { type: "movie"; movie?: ImportedMovie } | { type: "series"; series?: ImportedSeries }) {
    setData((d) => applyImport(d, payload));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setSaving(true);

    const payload = {
      ...data,
      tmdbId: tmdbIdInput ? parseInt(tmdbIdInput, 10) : null,
      featured: Boolean(data.featured),
      published: Boolean(data.published),
      genreIds,
      files: files.filter((f) => f.link && f.link.trim().length > 0),
    };

    try {
      const url =
        mode === "create"
          ? "/api/admin/movies"
          : `/api/admin/movies/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        error?: string;
        issues?: { fieldErrors?: Record<string, string[]> };
        data?: { id: string };
      };
      if (!res.ok) {
        const list: string[] = [];
        if (json.error) list.push(json.error);
        if (json.issues?.fieldErrors) {
          for (const [field, messages] of Object.entries(json.issues.fieldErrors)) {
            if (messages && messages.length > 0) {
              list.push(`${field}: ${messages.join(", ")}`);
            }
          }
        }
        setErrors(list.length > 0 ? list : ["Erro desconhecido."]);
        setSaving(false);
        return;
      }
      router.push("/admin/filmes?ok=1");
      router.refresh();
    } catch (err) {
      setErrors([(err as Error).message ?? "Falha na requisição"]);
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
    >
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <a href="/admin/filmes" className="btn btn--ghost">
          <FontAwesomeIcon icon={faArrowLeft} />
          Voltar
        </a>
      </div>

      {errors.length > 0 ? (
        <div className="alert" style={{ borderColor: "#d9534f", color: "#ff8a85" }}>
          <ul style={{ paddingLeft: "1.25rem", listStyle: "disc" }}>
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <Section title="Identificação">
        <Grid>
          <Field label="TMDB ID" required>
            <input
              type="number"
              value={tmdbIdInput}
              onChange={(e) => setTmdbIdInput(e.target.value)}
              style={inputStyle}
              placeholder="Ex: 550"
            />
          </Field>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <TmdbImportButton
              type="movie"
              tmdbId={tmdbIdInput}
              onImport={onImported}
            />
          </div>
        </Grid>
      </Section>

      <Section title="Informações gerais">
        <Grid>
          <Field label="Título" required>
            <input
              type="text"
              value={data.title}
              onChange={(e) => update("title", e.target.value)}
              required
              style={inputStyle}
            />
          </Field>
          <Field label="Título original">
            <input
              type="text"
              value={data.originalTitle ?? ""}
              onChange={(e) => update("originalTitle", e.target.value || null)}
              style={inputStyle}
            />
          </Field>
          <Field label="Slug" required>
            <input
              type="text"
              value={data.slug}
              onChange={(e) =>
                update(
                  "slug",
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]+/g, "-")
                    .replace(/^-+|-+$/g, ""),
                )
              }
              required
              style={inputStyle}
              placeholder="ex: nome-do-filme"
            />
          </Field>
          <Field label="Ano">
            <input
              type="number"
              value={data.year ?? ""}
              onChange={(e) =>
                update(
                  "year",
                  e.target.value ? parseInt(e.target.value, 10) : null,
                )
              }
              style={inputStyle}
              min={1800}
              max={2200}
            />
          </Field>
          <Field label="Duração (min)">
            <input
              type="number"
              value={data.runtime ?? ""}
              onChange={(e) =>
                update(
                  "runtime",
                  e.target.value ? parseInt(e.target.value, 10) : null,
                )
              }
              style={inputStyle}
            />
          </Field>
          <Field label="Classificação">
            <input
              type="text"
              value={data.classification ?? ""}
              onChange={(e) =>
                update("classification", e.target.value || null)
              }
              style={inputStyle}
              placeholder="Livre, 12 anos..."
            />
          </Field>
          <Field label="Nota TMDB">
            <input
              type="number"
              step="0.1"
              min={0}
              max={10}
              value={data.rating ?? ""}
              onChange={(e) =>
                update(
                  "rating",
                  e.target.value ? parseFloat(e.target.value) : null,
                )
              }
              style={inputStyle}
            />
          </Field>
          <Field label="Idiomas">
            <input
              type="text"
              value={data.languages ?? ""}
              onChange={(e) => update("languages", e.target.value || null)}
              style={inputStyle}
              placeholder="Português, Inglês"
            />
          </Field>
          <Field label="Ordem de exibição">
            <input
              type="number"
              value={data.order}
              onChange={(e) =>
                update("order", parseInt(e.target.value, 10) || 0)
              }
              style={inputStyle}
            />
          </Field>
        </Grid>
        <Field label="Overview / Sinopse">
          <textarea
            value={data.overview ?? ""}
            onChange={(e) => update("overview", e.target.value || null)}
            style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
          />
        </Field>
      </Section>

      <Section title="Mídia">
        <Grid>
          <Field label="URL do poster">
            <input
              type="url"
              value={data.poster ?? ""}
              onChange={(e) => update("poster", e.target.value || null)}
              style={inputStyle}
              placeholder="https://..."
            />
          </Field>
          <Field label="URL do backdrop">
            <input
              type="url"
              value={data.backdrop ?? ""}
              onChange={(e) => update("backdrop", e.target.value || null)}
              style={inputStyle}
              placeholder="https://..."
            />
          </Field>
          <Field label="Trailer (YouTube)">
            <input
              type="url"
              value={data.trailer ?? ""}
              onChange={(e) => update("trailer", e.target.value || null)}
              style={inputStyle}
              placeholder="https://youtube.com/..."
            />
          </Field>
        </Grid>
      </Section>

      <Section title="Gêneros">
        <GenreSelector
          genres={genres}
          selectedIds={genreIds}
          onChange={setGenreIds}
        />
      </Section>

      <Section title="Arquivos para download">
        <FileEditor value={files} onChange={setFiles} />
      </Section>

      <Section title="Publicação">
        <Grid>
          <Toggle
            label="Publicado"
            checked={data.published}
            onChange={(v) => update("published", v)}
          />
          <Toggle
            label="Destacar na home"
            checked={data.featured}
            onChange={(v) => update("featured", v)}
          />
        </Grid>
      </Section>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          <FontAwesomeIcon icon={faSave} />
          {saving ? "Salvando..." : mode === "create" ? "Criar filme" : "Salvar alterações"}
        </button>
        <a href="/admin/filmes" className="btn btn--ghost">
          Cancelar
        </a>
      </div>
    </form>
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
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <span style={{ fontSize: "0.8rem", color: "var(--light-text)" }}>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
        cursor: "pointer",
        fontSize: "0.95rem",
        color: "var(--text-color-1)",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: "var(--main-color)" }}
      />
      {label}
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
