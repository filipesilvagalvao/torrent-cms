import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faStar,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { listSeriesForAdmin } from "../../../services/series";
import { getAllGenres } from "../../../services/catalog";
import SeriesTableActions from "../../../components/admin/SeriesTableActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Séries" };

type SearchParams = {
  q?: string;
  status?: string;
  genreId?: string;
  page?: string;
  ok?: string;
};

export default async function AdminSeriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const [genres, result] = await Promise.all([
    getAllGenres(),
    listSeriesForAdmin({
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
          <h1>Séries</h1>
          <p>{result.total} títulos cadastrados.</p>
        </div>
        <Link href="/admin/series/novo" className="btn btn--primary">
          <FontAwesomeIcon icon={faPlus} />
          Nova série
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
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ background: "var(--bg-color-1)" }}>
              <th style={th}>Série</th>
              <th style={th}>Ano</th>
              <th style={th}>Nota</th>
              <th style={th}>
                <FontAwesomeIcon icon={faLayerGroup} /> Temporadas
              </th>
              <th style={th}>Episódios</th>
              <th style={th}>Status</th>
              <th style={th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "var(--light-text)" }}>
                  Nenhuma série encontrada.
                </td>
              </tr>
            ) : (
              result.items.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid var(--border-color)" }}>
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
                        {s.poster ? (
                          <Image src={s.poster} alt={s.title} fill sizes="44px" />
                        ) : null}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <strong style={{ color: "var(--text-color-1)" }}>{s.title}</strong>
                        <span style={{ color: "var(--light-text)", fontSize: "0.8rem" }}>
                          /series/{s.slug}
                        </span>
                        {s.genres.length > 0 ? (
                          <span style={{ color: "var(--light-text)", fontSize: "0.8rem" }}>
                            {s.genres.map((g) => g.name).join(", ")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td style={td}>{s.year ?? "—"}</td>
                  <td style={td}>
                    {s.rating ? (
                      <span
                        style={{
                          color: "var(--main-color)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <FontAwesomeIcon icon={faStar} />
                        {s.rating.toFixed(1)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={td}>{s.seasonsCount}</td>
                  <td style={td}>{s.episodesCount}</td>
                  <td style={td}>
                    <span
                      className="pill"
                      style={{
                        background: s.published
                          ? "rgba(121, 193, 66, 0.2)"
                          : "rgba(255, 255, 255, 0.08)",
                        color: s.published ? "var(--main-color)" : "var(--light-text)",
                        borderColor: s.published
                          ? "var(--main-color)"
                          : "var(--border-color)",
                      }}
                    >
                      {s.published ? "Publicado" : "Rascunho"}
                      {s.featured ? " · ★" : ""}
                    </span>
                  </td>
                  <td style={td}>
                    <SeriesTableActions
                      id={s.id}
                      initialPublished={s.published}
                      initialFeatured={s.featured}
                    />
                    <Link
                      href={`/admin/series/${s.id}/editar`}
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
              href={{ pathname: "/admin/series", query: { ...sp, page: String(p) } }}
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
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "0.7rem 0.85rem",
  textAlign: "left",
  color: "var(--light-text)",
  fontWeight: 600,
  fontSize: "0.75rem",
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
