import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function Loading() {
  return (
    <section
      style={{
        minHeight: "50vh",
        display: "grid",
        placeItems: "center",
        padding: "3rem 1.25rem",
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          style={{ fontSize: "2rem", color: "var(--main-color)" }}
        />
        <p style={{ color: "var(--light-text)", margin: 0 }}>
          Carregando conteúdo...
        </p>
      </div>
    </section>
  );
}
