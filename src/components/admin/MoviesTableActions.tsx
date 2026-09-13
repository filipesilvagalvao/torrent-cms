"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faStar,
  faTrash,
  faSpinner,
  faCircleCheck,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  id: string;
  initialPublished?: boolean;
  initialFeatured?: boolean;
};

type ActionResult = { ok: boolean; published?: boolean; featured?: boolean };

export default function MoviesTableActions(_props: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<"publish" | "feature" | "delete" | null>(
    null,
  );
  const [feedback, setFeedback] = useState<
    { kind: "ok" | "err"; message: string } | null
  >(null);

  async function patch(action: "publish" | "feature") {
    setBusy(action);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/movies/${_props.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json: ActionResult & { error?: string } = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro");
      setFeedback({
        kind: "ok",
        message:
          action === "publish"
            ? json.published
              ? "Publicado"
              : "Despublicado"
            : json.featured
              ? "Destacado"
              : "Removido do destaque",
      });
      router.refresh();
    } catch (e) {
      setFeedback({ kind: "err", message: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function deleteItem() {
    if (!confirm("Excluir este filme definitivamente?")) return;
    setBusy("delete");
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/movies/${_props.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Erro");
      }
      router.refresh();
    } catch (e) {
      setFeedback({ kind: "err", message: (e as Error).message });
      setBusy(null);
    }
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
      <button
        type="button"
        onClick={() => patch("publish")}
        disabled={busy !== null}
        style={btnStyle}
        title="Publicar/Despublicar"
      >
        {busy === "publish" ? (
          <FontAwesomeIcon icon={faSpinner} spin />
        ) : (
          <FontAwesomeIcon icon={_props.initialPublished ? faEyeSlash : faEye} />
        )}
      </button>
      <button
        type="button"
        onClick={() => patch("feature")}
        disabled={busy !== null}
        style={btnStyle}
        title="Destacar/Remover destaque"
      >
        {busy === "feature" ? (
          <FontAwesomeIcon icon={faSpinner} spin />
        ) : (
          <FontAwesomeIcon icon={faStar} />
        )}
      </button>
      <button
        type="button"
        onClick={deleteItem}
        disabled={busy !== null}
        style={{ ...btnStyle, color: "#ff8a85" }}
        title="Excluir"
      >
        {busy === "delete" ? (
          <FontAwesomeIcon icon={faSpinner} spin />
        ) : (
          <FontAwesomeIcon icon={faTrash} />
        )}
      </button>
      {feedback ? (
        <span
          style={{
            fontSize: "0.8rem",
            color: feedback.kind === "ok" ? "var(--main-color)" : "#ff8a85",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          <FontAwesomeIcon
            icon={feedback.kind === "ok" ? faCircleCheck : faTriangleExclamation}
          />
          {feedback.message}
        </span>
      ) : null}
    </span>
  );
}

const btnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.4rem 0.55rem",
  border: "1px solid var(--border-color)",
  borderRadius: "var(--radius-sm)",
  background: "transparent",
  color: "var(--text-color-2)",
  cursor: "pointer",
};
