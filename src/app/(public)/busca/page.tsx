import { prisma } from "../../../lib/prisma";
import MediaGridSection from "../../../components/sections/MediaGridSection";

export const metadata = {
  title: "Busca",
  description: "Pesquise filmes e séries no catálogo Playcinix.",
};

type SearchParams = { q?: string; page?: string };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();

  const movies = term
    ? await prisma.movie.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: term } },
            { originalTitle: { contains: term } },
          ],
        },
        include: { genres: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const series = term
    ? await prisma.series.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: term } },
            { originalTitle: { contains: term } },
          ],
        },
        include: { genres: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <section className="section">
      <div className="container">
        <header className="page-header" style={{ padding: 0, border: "none", marginBottom: "2rem" }}>
          <h1>Busca</h1>
          <p>
            {term
              ? `Resultados para "${term}".`
              : "Use o campo de busca no topo do site para pesquisar filmes e séries."}
          </p>
        </header>
        {term ? (
          <>
            <MediaGridSection
              title="Filmes"
              type="movie"
              items={movies.map((m) => ({
                id: m.id,
                slug: m.slug,
                title: m.title,
                year: m.year,
                rating: m.rating,
                poster: m.poster,
                genres: m.genres,
              }))}
              emptyMessage="Nenhum filme encontrado."
            />
            <MediaGridSection
              title="Séries"
              type="series"
              items={series.map((s) => ({
                id: s.id,
                slug: s.slug,
                title: s.title,
                year: s.year,
                rating: s.rating,
                poster: s.poster,
                genres: s.genres,
              }))}
              emptyMessage="Nenhuma série encontrada."
            />
          </>
        ) : null}
      </div>
    </section>
  );
}
