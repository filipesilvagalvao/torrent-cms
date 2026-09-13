"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Em produção seria enviado a um serviço de monitoramento
    if (process.env.NODE_ENV !== "production") {
      console.error("Unhandled error:", error);
    }
  }, [error]);

  return (
    <section
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        padding: "3rem 1.25rem",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 520 }}>
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          style={{ fontSize: "2.5rem", color: "var(--warning)" }}
        />
        <h1 style={{ fontSize: "1.8rem", margin: "1rem 0 0.5rem" }}>
          Algo deu errado
        </h1>
        <p
          style={{
            color: "var(--light-text)",
            marginBottom: "1.5rem",
          }}
        >
          Ocorreu um erro inesperado ao carregar esta página.
          {error.digest ? (
            <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.8rem" }}>
              Código: {error.digest}
            </span>
          ) : null}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => reset()}
          >
            <FontAwesomeIcon icon={faRotateRight} /> Tentar novamente
          </button>
          <Link href="/" className="btn btn--ghost">
            Voltar para home
          </Link>
        </div>
      </div>
    </section>
  );
}
