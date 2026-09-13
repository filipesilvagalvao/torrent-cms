"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faArrowLeft,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import FileEditor from "./FileEditor";
import type { FileDraft } from "./FileEditor";

type Episode = {
  id: string;
  number: number;
  title: string;
  overview: string | null;
  runtime: number | null;
  airDate: string | null;
  stillImage: string | null;
  files: FileDraft[];
};

type Props = {
  mode: "create" | "edit";
  seasonId: string;
  seasonsHref: string;
  initial?: Episode;
};

const blank: Episode = {
  id: "",
  number: 0,
  title: "",
  overview: null,
  runtime: null,
  airDate: null,
  stillImage: null,
  files: [],
};

export default function EpisodeForm({
  mode,
  seasonId,
  seasonsHref,
  initial,
}: Props) {
  const router = useRouter();
  const [data, setData] = useState<Episode>(initial ?? blank);
  const [files, setFiles] = useState<FileDraft[]>(initial?.files ?? []);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function update<K extends keyof Episode>(key: K, value: Episode[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setSaving(true);
    const payload = {
      number: data.number,
      title: data.title,
      overview: data.overview,
      runtime: data.runtime,
      airDate: data.airDate,
      stillImage: data.stillImage,
      files: files.filter((f) => f.link && f.link.trim().length > 0),
    };
    try {
      const url =
        mode === "create"
          ? `/api/admin/seasons/${seasonId}/episodes`
          : `/api/admin/episodes/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        error?: string;
        issues?: { fieldErrors?: Record<string, string[]> };
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
      router.push(seasonsHref);
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
        <Link href={seasonsHref} className="btn btn--ghost">
          <FontAwesomeIcon icon={faArrowLeft} /> Voltar
        </Link>
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

      <Section title="Informações do episódio">
        <Grid>
          <Field label="Número *" required>
            <input
              type="number"
              min={0}
              value={data.number}
              onChange={(e) =>
                update("number", parseInt(e.target.value, 10) || 0)
              }
              required
              style={inputStyle}
            />
          </Field>
          <Field label="Título *" required>
            <input
              type="text"
              value={data.title}
              onChange={(e) => update("title", e.target.value)}
              required
              style={inputStyle}
              placeholder="Ex: O início"
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
          <Field label="Data de exibição">
            <input
              type="date"
              value={data.airDate ?? ""}
              onChange={(e) => update("airDate", e.target.value || null)}
              style={inputStyle}
            />
          </Field>
          <Field label="Imagem do episódio (URL)">
            <input
              type="url"
              value={data.stillImage ?? ""}
              onChange={(e) =>
                update("stillImage", e.target.value || null)
              }
              style={inputStyle}
              placeholder="https://..."
            />
          </Field>
        </Grid>
        <Field label="Overview">
          <textarea
            value={data.overview ?? ""}
            onChange={(e) => update("overview", e.target.value || null)}
            style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
          />
        </Field>
      </Section>

      <Section title="Arquivos para download">
        <FileEditor value={files} onChange={setFiles} />
      </Section>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          <FontAwesomeIcon icon={faSave} />
          {saving
            ? "Salvando..."
            : mode === "create"
              ? "Criar episódio"
              : "Salvar alterações"}
        </button>
        <Link href={seasonsHref} className="btn btn--ghost">
          <FontAwesomeIcon icon={faTrash} /> Cancelar
        </Link>
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

const inputStyle: React.CSSProperties = {
  background: "var(--bg-color-1)",
  border: "1px solid var(--border-color)",
  borderRadius: "var(--radius-sm)",
  padding: "0.55rem 0.75rem",
  color: "var(--text-color-1)",
  fontSize: "0.9rem",
  width: "100%",
};
