"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCircleXmark,
  faSpinner,
  faCircleCheck,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  id: string;
  initialApproved: boolean;
};

export default function CommentsAdminActions({ id, initialApproved }: Props) {
  const router = useRouter();
  const [approved, setApproved] = useState(initialApproved);
  const [busy, setBusy] = useState<"approve" | "delete" | null>(null);
  const [feedback, setFeedback] = useState<
    { kind: "ok" | "err"; message: string } | null
  >(null);

  async function toggleApprove() {
    setBusy("approve");
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: "PATCH" });
      const json = (await res.json()) as { data?: { approved: boolean }; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Erro");
      setApproved(Boolean(json.data?.approved));
      setFeedback({
        kind: "ok",
        message: json.data?.approved ? "Aprovado" : "Ocultado",
      });
      router.refresh();
    } catch (e) {
      setFeedback({ kind: "err", message: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!confirm("Excluir permanentemente este comentário?")) return;
    setBusy("delete");
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
        className="btn btn--ghost"
        onClick={toggleApprove}
        disabled={busy !== null}
        style={{ padding: "0.35rem 0.85rem" }}
      >
        {busy === "approve" ? (
          <FontAwesomeIcon icon={faSpinner} spin />
        ) : (
          <FontAwesomeIcon icon={approved ? faCircleXmark : faCheck} />
        )}
        {approved ? "Ocultar" : "Aprovar"}
      </button>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={remove}
        disabled={busy !== null}
        style={{ padding: "0.35rem 0.85rem", color: "#ff8a85" }}
      >
        {busy === "delete" ? (
          <FontAwesomeIcon icon={faSpinner} spin />
        ) : (
          <FontAwesomeIcon icon={faCircleXmark} />
        )}
        Excluir
      </button>
      {feedback ? (
        <span
          style={{
            fontSize: "0.8rem",
            color: feedback.kind === "ok" ? "var(--main-color)" : "#ff8a85",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          <FontAwesomeIcon
            icon={feedback.kind === "ok" ? faCircleCheck : faTriangleExclamation}
          />
          {feedback.message}
        </span>
      ) : null}
    </div>
  );
}
