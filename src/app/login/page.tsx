import LoginForm from "../../components/auth/LoginForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem 1rem",
        background:
          "radial-gradient(ellipse at top, rgba(121,193,66,0.05), transparent 60%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--bg-color-2)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          boxShadow: "var(--shadow-2)",
        }}
      >
        <header style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <Link
            href="/"
            className="site-logo"
            style={{ justifyContent: "center", marginBottom: "0.5rem" }}
          >
            <span className="site-logo__name" style={{ fontSize: "1.4rem" }}>
              Playcinix
            </span>
          </Link>
          <p style={{ color: "var(--light-text)", margin: 0 }}>
            Acesso ao painel administrativo
          </p>
        </header>
        <LoginForm />
        <p
          style={{
            color: "var(--light-text)",
            fontSize: "0.8rem",
            margin: "1.5rem 0 0",
            textAlign: "center",
          }}
        >
          <Link href="/" style={{ color: "var(--main-color)" }}>
            ← Voltar para o site
          </Link>
        </p>
      </div>
    </div>
  );
}
