"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

export type FileDraft = {
  id?: string;
  name: string;
  quality: string;
  resolution: string;
  format: string;
  language: string;
  subtitle: string;
  size: string;
  link: string;
};

type Props = {
  value: FileDraft[];
  onChange: (files: FileDraft[]) => void;
};

const emptyFile = (): FileDraft => ({
  name: "",
  quality: "",
  resolution: "",
  format: "",
  language: "",
  subtitle: "",
  size: "",
  link: "",
});

export default function FileEditor({ value, onChange }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(value.length > 0 ? 0 : null);

  function add() {
    const next = [...value, emptyFile()];
    onChange(next);
    setOpenIndex(next.length - 1);
  }

  function update(index: number, patch: Partial<FileDraft>) {
    const next = value.map((f, i) => (i === index ? { ...f, ...patch } : f));
    onChange(next);
  }

  function remove(index: number) {
    const next = value.filter((_, i) => i !== index);
    onChange(next);
    if (openIndex === index) setOpenIndex(null);
    else if (openIndex !== null && openIndex > index) setOpenIndex(openIndex - 1);
  }

  function labelFor(file: FileDraft, index: number) {
    const parts = [
      file.resolution || file.quality,
      file.format,
      file.language,
      file.size,
    ].filter(Boolean);
    if (parts.length === 0) return `Arquivo #${index + 1}`;
    return `Arquivo #${index + 1} · ${parts.join(" · ")}`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {value.map((file, index) => {
        const open = openIndex === index;
        return (
          <div
            key={index}
            style={{
              background: "var(--bg-color-1)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.85rem 1rem",
                color: "var(--text-color-1)",
                fontWeight: 600,
              }}
            >
              <span>{labelFor(file, index)}</span>
              <span style={{ color: "var(--light-text)", fontSize: "0.85rem" }}>
                {open ? "−" : "+"}
              </span>
            </button>
            {open ? (
              <div
                style={{
                  padding: "1rem",
                  display: "grid",
                  gap: "0.75rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  borderTop: "1px solid var(--border-color)",
                }}
              >
                <Field
                  label="Nome do arquivo"
                  value={file.name}
                  onChange={(v) => update(index, { name: v })}
                />
                <Field
                  label="Qualidade"
                  placeholder="Full HD, 4K..."
                  value={file.quality}
                  onChange={(v) => update(index, { quality: v })}
                />
                <Field
                  label="Resolução"
                  placeholder="720p, 1080p, 2160p"
                  value={file.resolution}
                  onChange={(v) => update(index, { resolution: v })}
                />
                <Field
                  label="Formato"
                  placeholder="MP4, MKV..."
                  value={file.format}
                  onChange={(v) => update(index, { format: v })}
                />
                <Field
                  label="Idioma/Áudio"
                  placeholder="Português"
                  value={file.language}
                  onChange={(v) => update(index, { language: v })}
                />
                <Field
                  label="Legenda"
                  placeholder="Português, Inglês"
                  value={file.subtitle}
                  onChange={(v) => update(index, { subtitle: v })}
                />
                <Field
                  label="Tamanho"
                  placeholder="2.4 GB"
                  value={file.size}
                  onChange={(v) => update(index, { size: v })}
                />
                <Field
                  label="Link de download"
                  required
                  value={file.link}
                  onChange={(v) => update(index, { link: v })}
                />
                <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => remove(index)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Excluir arquivo
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
      <button
        type="button"
        className="btn btn--ghost"
        onClick={add}
        style={{ alignSelf: "flex-start" }}
      >
        <FontAwesomeIcon icon={faPlus} />
        Adicionar arquivo
      </button>
    </div>
  );
}

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <span style={{ fontSize: "0.8rem", color: "var(--light-text)" }}>
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
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
};
