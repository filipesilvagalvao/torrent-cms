import Link from "next/link";
import { auth } from "../../auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGauge,
  faFilm,
  faTv,
  faList,
  faComments,
  faDownload,
  faGears,
} from "@fortawesome/free-solid-svg-icons";
import AdminLogoutButton from "./AdminLogoutButton";

const items = [
  { href: "/admin", label: "Dashboard", icon: faGauge },
  { href: "/admin/filmes", label: "Filmes", icon: faFilm },
  { href: "/admin/series", label: "Séries", icon: faTv },
  { href: "/admin/categorias", label: "Categorias", icon: faList },
  { href: "/admin/comentarios", label: "Comentários", icon: faComments },
  { href: "/admin/downloads", label: "Downloads", icon: faDownload },
  { href: "/admin/configuracoes", label: "Configurações", icon: faGears },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        minHeight: "calc(100vh)",
      }}
    >
      <aside
        style={{
          background: "var(--bg-color-2)",
          borderRight: "1px solid var(--border-color)",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <h2
            style={{
              color: "var(--text-color-1)",
              fontSize: "1.1rem",
            }}
          >
            Painel
          </h2>
          {session?.user ? (
            <p
              style={{
                color: "var(--light-text)",
                fontSize: "0.78rem",
                margin: "0.25rem 0 0",
                wordBreak: "break-all",
              }}
            >
              {session.user.name ?? session.user.email}
            </p>
          ) : null}
        </div>
        <nav aria-label="Painel administrativo">
          <ul style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--text-color-2)",
                    fontSize: "0.95rem",
                  }}
                >
                  <FontAwesomeIcon icon={item.icon} fixedWidth />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
          <p style={{ color: "var(--light-text)", fontSize: "0.75rem", margin: "0 0 0.5rem" }}>
            <Link href="/" style={{ color: "var(--text-color-2)" }}>
              ← Ver site
            </Link>
          </p>
          <AdminLogoutButton />
        </div>
      </aside>
      <section style={{ padding: "2rem" }}>{children}</section>
    </div>
  );
}
