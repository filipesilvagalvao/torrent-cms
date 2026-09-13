import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { formatDate } from "../../../lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Downloads" };

type SearchParams = { type?: "movie" | "episode" };

export default async function AdminDownloadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { type } = await searchParams;

  // Busca arquivos de filmes publicados
  const movieFiles = await prisma.file.findMany({
    where: {
      movie: { published: true },
      ...(type && type !== "movie" ? { movieId: null } : {}),
    },
    include: {
      movie: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Busca arquivos de episódios (séries publicadas)
  const episodeFiles = await prisma.file.findMany({
    where: {
      episode: {
        season: { series: { published: true } },
      },
      ...(type === "movie" ? { episodeId: null } : {}),
    },
    include: {
      episode: {
        include: {
          season: {
            include: {
              series: { select: { id: true, title: true, slug: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const total = movieFiles.length + episodeFiles.length;

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
          <h1>Arquivos disponíveis</h1>
          <p>{total} arquivo(s) relacionado(s) a conteúdo publicado.</p>
        </div>
        <form method="get" style={{ display: "flex", gap: "0.4rem" }}>
          <select
            name="type"
            defaultValue={type ?? ""}
            style={{
              background: "var(--bg-color-1)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-sm)",
              padding: "0.45rem 0.75rem",
              color: "var(--text-color-1)",
            }}
          >
            <option value="">Todos</option>
            <option value="movie">Filmes</option>
            <option value="episode">Episódios</option>
          </select>
          <button type="submit" className="btn btn--ghost">
            Filtrar
          </button>
        </form>
      </header>

      {total === 0 ? (
        <div className="empty-state">
          <h3>Sem arquivos</h3>
          <p>Cadastre arquivos nos filmes ou episódios para vê-los aqui.</p>
        </div>
      ) : (
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
                <th style={th}>Conteúdo</th>
                <th style={th}>Qualidade</th>
                <th style={th}>Formato</th>
                <th style={th}>Idioma</th>
                <th style={th}>Tamanho</th>
                <th style={th}>Cadastrado</th>
                <th style={th}>Link</th>
              </tr>
            </thead>
            <tbody>
              {movieFiles.map((f) => (
                <tr key={f.id} style={{ borderTop: "1px solid var(--border-color)" }}>
                  <td style={td}>
                    <Link
                      href={`/filmes/${f.movie?.slug}`}
                      style={{ color: "var(--text-color-1)", fontWeight: 600 }}
                    >
                      🎬 {f.movie?.title ?? "—"}
                    </Link>
                  </td>
                  <td style={td}>{f.resolution || f.quality || "—"}</td>
                  <td style={td}>{f.format || "—"}</td>
                  <td style={td}>{f.language || "—"}</td>
                  <td style={td}>{f.size || "—"}</td>
                  <td style={td}>{formatDate(f.createdAt)}</td>
                  <td style={td}>
                    <a
                      href={f.link}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "var(--main-color)" }}
                      title={f.link}
                    >
                      Abrir
                    </a>
                  </td>
                </tr>
              ))}
              {episodeFiles.map((f) => {
                const ep = f.episode;
                const s = ep?.season;
                const series = s?.series;
                return (
                  <tr key={f.id} style={{ borderTop: "1px solid var(--border-color)" }}>
                    <td style={td}>
                      <Link
                        href={`/series/${series?.slug}`}
                        style={{ color: "var(--text-color-1)", fontWeight: 600 }}
                      >
                        📺 {series?.title ?? "—"} · T{s?.number} · E{ep?.number}
                      </Link>
                    </td>
                    <td style={td}>{f.resolution || f.quality || "—"}</td>
                    <td style={td}>{f.format || "—"}</td>
                    <td style={td}>{f.language || "—"}</td>
                    <td style={td}>{f.size || "—"}</td>
                    <td style={td}>{formatDate(f.createdAt)}</td>
                    <td style={td}>
                      <a
                        href={f.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--main-color)" }}
                        title={f.link}
                      >
                        Abrir
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
