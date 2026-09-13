"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import GenreSelector from "./GenreSelector";
import TmdbImportButton from "./TmdbImportButton";
import type { ImportedSeries } from "../../services/tmdb";

type Genre = { id: string; name: string };

type InitialSeries = {
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
  languages: string | null;
  featured: boolean;
  published: boolean;
  order: number;
  genreIds: string[];
};

type Props = {
  mode: "create" | "edit";
  genres: Genre[];
  initial?: InitialSeries;
  onSubmitRedirect?: string;
};

const blank: InitialSeries = {
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
  languages: null,
  featured: false,
  published: false,
  order: 0,
  genreIds: [],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SeriesForm({
  mode,
  genres,
  initial,
  onSubmitRedirect,
}: Props) {
  const router = useRouter();
  const [data, setData] = useState<InitialSeries>(initial ?? blank);
  const [genreIds, setGenreIds] = useState<string[]>(initial?.genreIds ?? []);
  const [tmdbIdInput, setTmdbIdInput] = useState<string>(
    initial?.tmdbId ? String(initial.tmdbId) : "",
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function update<K extends keyof InitialSeries>(
    key: K,
    value: InitialSeries[K],
  ) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function onImported(payload: {
    type: "series";
    series?: {
      tmdbId: number;
      title: string;
      originalTitle: string | null;
      overview: string | null;
      year: number | null;
      rating: number | null;
      runtime: number | null;
      languages: string | null;
      poster: string | null;
      backdrop: string | null;
      genres: string[];
    };
  }) {
    const s = payload.series;
    if (!s) return;
    setData((d) => ({
      ...d,
      tmdbId: s.tmdbId,
      title: s.title || d.title,
      originalTitle: s.originalTitle ?? d.originalTitle,
      overview: s.overview ?? d.overview,
      year: s.year ?? d.year,
      rating: s.rating ?? d.rating,
      languages: s.languages ?? d.languages,
      poster: s.poster ?? d.poster,
      backdrop: s.backdrop ?? d.backdrop,
    }));
    // Mapeia nomes de gêneros vindos do TMDB para ids do nosso banco (best-effort)
    const matching = genres.filter((g) => s.genres.includes(g.name)).map((g) => g.id);
    if (matching.length > 0) {
      setGenreIds((current) => Array.from(new Set([...current, ...matching])));
    }
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
    };

    try {
      const url =
        mode === "create"
          ? "/api/admin/series"
          : `/api/admin/series/${initial?.id}`;
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
            if (messages && messages.length > 0)
              list.push(`${field}: ${messages.join(", ")}`);
          }
        }
        setErrors(list.length > 0 ? list : ["Erro desconhecido."]);
        setSaving(false);
        return;
      }
      const target =
        onSubmitRedirect ??
        (mode === "create"
          ? `/admin/series/${json.data?.id}/seasons`
          : `/admin/series/${initial?.id}/editar`);
      router.push(target);
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
        <a href="/admin/series" className="btn btn--ghost">
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
              placeholder="Ex: 1399"
            />
          </Field>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <TmdbImportButton
              type="series"
              tmdbId={tmdbIdInput}
              onImport={(payload) => {
                if (payload.type !== "series") return;
                onImported(payload as { type: "series"; series?: ImportedSeries });
              }}
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
              onChange={(e) => update("slug", slugify(e.target.value))}
              required
              style={inputStyle}
              placeholder="ex: nome-da-serie"
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
          <Field label="Classificação">
            <input
              type="text"
              value={data.classification ?? ""}
              onChange={(e) =>
                update("classification", e.target.value || null)
              }
              style={inputStyle}
              placeholder="Livre, 14 anos..."
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
          {saving
            ? "Salvando..."
            : mode === "create"
              ? "Criar série"
              : "Salvar alterações"}
        </button>
        <a href="/admin/series" className="btn btn--ghost">
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
