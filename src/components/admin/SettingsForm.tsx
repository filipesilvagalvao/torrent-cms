"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faSpinner,
  faCircleCheck,
  faTriangleExclamation,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

type Settings = {
  siteName: string;
  siteDescription: string | null;
  tmdbApiKey: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  telegramUrl: string | null;
  whatsappNumber: string | null;
};

type Props = {
  initial: Settings;
  hasStoredTmdbKey: boolean;
};

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function SettingsForm({ initial, hasStoredTmdbKey }: Props) {
  const router = useRouter();
  const [siteName, setSiteName] = useState(initial.siteName);
  const [siteDescription, setSiteDescription] = useState(
    initial.siteDescription ?? "",
  );
  const [tmdbApiKey, setTmdbApiKey] = useState("");
  const [facebookUrl, setFacebookUrl] = useState(initial.facebookUrl ?? "");
  const [twitterUrl, setTwitterUrl] = useState(initial.twitterUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl ?? "");
  const [telegramUrl, setTelegramUrl] = useState(initial.telegramUrl ?? "");
  const [whatsappNumber, setWhatsappNumber] = useState(
    initial.whatsappNumber ?? "",
  );
  const [showTmdbInput, setShowTmdbInput] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "saving" });
    try {
      const payload = {
        siteName: siteName.trim(),
        siteDescription: siteDescription.trim(),
        // mantém a chave existente se o usuário não digitou uma nova
        tmdbApiKey: tmdbApiKey.trim() ? tmdbApiKey.trim() : (hasStoredTmdbKey ? `•••• ${initial.tmdbApiKey?.slice(-4) ?? ""}` : ""),
        facebookUrl: facebookUrl.trim() || "",
        twitterUrl: twitterUrl.trim() || "",
        instagramUrl: instagramUrl.trim() || "",
        telegramUrl: telegramUrl.trim() || "",
        whatsappNumber: whatsappNumber.replace(/[^0-9]/g, ""),
      };
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        error?: string;
        issues?: { fieldErrors?: Record<string, string[]> };
        data?: Settings;
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
      setStatus({ kind: "success" });
      setTmdbApiKey("");
      router.refresh();
    } catch (e) {
      setStatus({ kind: "error", message: (e as Error).message });
    }
  }

  return (
    <form
      onSubmit={save}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      <Section title="Identidade do site">
        <Field label="Nome do site *">
          <input
            type="text"
            required
            maxLength={120}
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            style={inputStyle}
          />
        </Field>
        <Field label="Descrição">
          <textarea
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            placeholder="Frase curta exibida no site e em SEO."
          />
        </Field>
      </Section>

      <Section title="TMDB (importação por ID)">
        <div className="alert alert--info" style={{ marginTop: 0 }}>
          A chave é usada somente em chamadas server-side e nunca é exposta ao
          frontend.
        </div>
        <Field
          label={
            hasStoredTmdbKey
              ? "Chave já configurada (deixe vazio para manter a atual)"
              : "TMDB API Key *"
          }
        >
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "stretch",
            }}
          >
            <input
              type={showTmdbInput ? "text" : "password"}
              value={tmdbApiKey}
              onChange={(e) => setTmdbApiKey(e.target.value)}
              style={{ ...inputStyle, fontFamily: "monospace" }}
              placeholder={
                hasStoredTmdbKey
                  ? initial.tmdbApiKey ?? "••••"
                  : "Cole aqui sua chave v3 do TMDB"
              }
              autoComplete="off"
            />
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setShowTmdbInput((v) => !v)}
              style={{ padding: "0.5rem 0.75rem" }}
              title={showTmdbInput ? "Ocultar" : "Mostrar"}
            >
              <FontAwesomeIcon icon={showTmdbInput ? faEyeSlash : faEye} />
            </button>
          </div>
        </Field>
      </Section>

      <Section title="Redes sociais (opcional)">
        <Grid>
          <Field label="Facebook (URL)">
            <input
              type="url"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              style={inputStyle}
              placeholder="https://facebook.com/..."
            />
          </Field>
          <Field label="Twitter / X (URL)">
            <input
              type="url"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              style={inputStyle}
              placeholder="https://twitter.com/..."
            />
          </Field>
          <Field label="Instagram (URL)">
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              style={inputStyle}
              placeholder="https://instagram.com/..."
            />
          </Field>
          <Field label="Telegram (URL)">
            <input
              type="url"
              value={telegramUrl}
              onChange={(e) => setTelegramUrl(e.target.value)}
              style={inputStyle}
              placeholder="https://t.me/..."
            />
          </Field>
          <Field label="WhatsApp (apenas dígitos)">
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              style={inputStyle}
              placeholder="5511999999999"
            />
          </Field>
        </Grid>
      </Section>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <button type="submit" className="btn btn--primary" disabled={status.kind === "saving"}>
          {status.kind === "saving" ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
          {status.kind === "saving" ? "Salvando..." : "Salvar configurações"}
        </button>
        {status.kind === "success" ? (
          <span
            style={{
              color: "var(--main-color)",
              fontSize: "0.9rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <FontAwesomeIcon icon={faCircleCheck} />
            Configurações salvas.
          </span>
        ) : null}
        {status.kind === "error" ? (
          <span
            style={{
              color: "#ff8a85",
              fontSize: "0.9rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <FontAwesomeIcon icon={faTriangleExclamation} />
            {status.message}
          </span>
        ) : null}
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
        gap: "0.85rem",
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
