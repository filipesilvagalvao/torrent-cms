import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import MediaGridSection from "../../../../components/sections/MediaGridSection";

type Params = { slug: string };

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const genre = await prisma.genre.findUnique({ where: { slug } });
  if (!genre) return { title: "Categoria não encontrada" };
  return {
    title: `Categoria: ${genre.name}`,
    description: `Filmes e séries de ${genre.name} no Playcinix.`,
  };
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const genre = await prisma.genre.findUnique({ where: { slug } });
  if (!genre) notFound();

  const [movies, series] = await Promise.all([
    prisma.movie.findMany({
      where: { published: true, genres: { some: { id: genre.id } } },
      include: { genres: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.series.findMany({
      where: { published: true, genres: { some: { id: genre.id } } },
      include: { genres: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <section className="section">
      <div className="container">
        <header className="page-header" style={{ padding: 0, border: "none", marginBottom: "2rem" }}>
          <h1>{genre.name}</h1>
          <p>Conteúdos disponíveis na categoria {genre.name}.</p>
        </header>
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
          emptyMessage={`Nenhum filme em ${genre.name}.`}
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
          emptyMessage={`Nenhuma série em ${genre.name}.`}
        />
      </div>
    </section>
  );
}
