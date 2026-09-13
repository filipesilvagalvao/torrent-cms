import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export const dynamic = "force-static";

export const metadata = {
  title: "Página não encontrada",
  robots: { index: false },
};

export default function NotFound() {
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
        <span
          className="pill"
          style={{ marginBottom: "1rem", display: "inline-block" }}
        >
          404
        </span>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
          Conteúdo não encontrado
        </h1>
        <p
          style={{
            color: "var(--light-text)",
            marginBottom: "1.5rem",
          }}
        >
          A página que você procura pode ter sido removida, renomeada ou
          ainda não está disponível no catálogo público.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <Link href="/" className="btn btn--primary">
            <FontAwesomeIcon icon={faHouse} /> Página inicial
          </Link>
          <Link href="/busca" className="btn btn--ghost">
            <FontAwesomeIcon icon={faMagnifyingGlass} /> Buscar conteúdo
          </Link>
        </div>
      </div>
    </section>
  );
}
