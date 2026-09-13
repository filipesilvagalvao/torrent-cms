import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faEye,
  faEyeSlash,
  faStar,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { listMoviesForAdmin } from "../../../services/movies";
import { getAllGenres } from "../../../services/catalog";
import MoviesTableActions from "../../../components/admin/MoviesTableActions";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  status?: string;
  genreId?: string;
  page?: string;
  ok?: string;
};

export const metadata = { title: "Filmes" };

export default async function AdminFilmesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const [genres, result] = await Promise.all([
    getAllGenres(),
    listMoviesForAdmin({
      q: sp.q,
      status:
        sp.status === "published" || sp.status === "draft"
          ? sp.status
          : "all",
      genreId: sp.genreId,
      page: sp.page ? Number(sp.page) : 1,
      pageSize: 20,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div>
      <header
        className="page-header"
        style={{
          padding: 0,
          border: "none",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1>Filmes</h1>
          <p>{result.total} títulos cadastrados.</p>
        </div>
        <Link href="/admin/filmes/novo" className="btn btn--primary">
          <FontAwesomeIcon icon={faPlus} />
          Novo filme
        </Link>
      </header>

      {sp.ok ? (
        <div className="alert alert--info">Ação realizada com sucesso.</div>
      ) : null}

      <form
        method="get"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr auto",
          gap: "0.5rem",
          marginBottom: "1.25rem",
        }}
      >
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Buscar por título, slug..."
          style={inputStyle}
        />
        <select name="status" defaultValue={sp.status ?? "all"} style={inputStyle}>
          <option value="all">Todos</option>
          <option value="published">Publicados</option>
          <option value="draft">Rascunhos</option>
        </select>
        <select name="genreId" defaultValue={sp.genreId ?? ""} style={inputStyle}>
          <option value="">Todos os gêneros</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn--ghost">
          Filtrar
        </button>
      </form>

      <div
        style={{
          background: "var(--bg-color-2)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.9rem",
          }}
        >
          <thead>
            <tr style={{ background: "var(--bg-color-1)" }}>
              <th style={th}>Filme</th>
              <th style={th}>Ano</th>
              <th style={th}>Nota</th>
              <th style={th}>Arquivos</th>
              <th style={th}>Status</th>
              <th style={th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "var(--light-text)" }}>
                  Nenhum filme encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              result.items.map((m) => (
                <tr key={m.id} style={{ borderTop: "1px solid var(--border-color)" }}>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: 44,
                          height: 64,
                          flexShrink: 0,
                          borderRadius: 6,
                          overflow: "hidden",
                          background: "var(--bg-color-1)",
                          position: "relative",
                        }}
                      >
                        {m.poster ? (
                          <Image
                            src={m.poster}
                            alt={m.title}
                            fill
                            sizes="44px"
                          />
                        ) : null}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <strong style={{ color: "var(--text-color-1)" }}>{m.title}</strong>
                        <span style={{ color: "var(--light-text)", fontSize: "0.8rem" }}>
                          /filmes/{m.slug}
                        </span>
                        {m.genres.length > 0 ? (
                          <span style={{ color: "var(--light-text)", fontSize: "0.8rem" }}>
                            {m.genres.map((g) => g.name).join(", ")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td style={td}>{m.year ?? "—"}</td>
                  <td style={td}>
                    {m.rating ? (
                      <span style={{ color: "var(--main-color)", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                        <FontAwesomeIcon icon={faStar} />
                        {m.rating.toFixed(1)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={td}>{m.filesCount}</td>
                  <td style={td}>
                    <span
                      className="pill"
                      style={{
                        background: m.published
                          ? "rgba(121, 193, 66, 0.2)"
                          : "rgba(255, 255, 255, 0.08)",
                        color: m.published ? "var(--main-color)" : "var(--light-text)",
                        borderColor: m.published
                          ? "var(--main-color)"
                          : "var(--border-color)",
                      }}
                    >
                      {m.published ? "Publicado" : "Rascunho"}
                      {m.featured ? " · ★" : ""}
                    </span>
                  </td>
                  <td style={td}>
                    <MoviesTableActions
                      id={m.id}
                      initialPublished={m.published}
                      initialFeatured={m.featured}
                    />
                    <Link
                      href={`/admin/filmes/${m.id}/editar`}
                      style={iconBtn()}
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <nav
          aria-label="Paginação"
          style={{
            marginTop: "1rem",
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
          }}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={{
                pathname: "/admin/filmes",
                query: { ...sp, page: String(p) },
              }}
              className="btn btn--ghost"
              style={{
                background: p === result.page ? "var(--main-color)" : undefined,
                color: p === result.page ? "var(--bg-color-1)" : undefined,
              }}
            >
              {p}
            </Link>
          ))}
        </nav>
      ) : null}

      {/* Acessibilidade: ícones sem uso no fade */}
      <span className="visually-hidden">
        <FontAwesomeIcon icon={faEye} />
        <FontAwesomeIcon icon={faEyeSlash} />
        <FontAwesomeIcon icon={faTrash} />
      </span>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "0.7rem 0.85rem",
  textAlign: "left",
  color: "var(--light-text)",
  fontWeight: 600,
  fontSize: "0.8rem",
  textTransform: "uppercase",
  letterSpacing: 0.4,
};
const td: React.CSSProperties = { padding: "0.7rem 0.85rem", verticalAlign: "middle" };
const inputStyle: React.CSSProperties = {
  background: "var(--bg-color-1)",
  border: "1px solid var(--border-color)",
  borderRadius: "var(--radius-sm)",
  padding: "0.5rem 0.75rem",
  color: "var(--text-color-1)",
};
function iconBtn(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.4rem 0.55rem",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-color-2)",
    marginRight: "0.25rem",
  };
}
