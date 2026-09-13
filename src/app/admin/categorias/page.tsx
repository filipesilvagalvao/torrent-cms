import { prisma } from "../../../lib/prisma";
import GenresList from "../../../components/admin/GenresList";

export const dynamic = "force-dynamic";

export const metadata = { title: "Categorias" };

export default async function AdminCategoriasPage() {
  const genres = await prisma.genre.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { movies: true, series: true } } },
  });

  return (
    <div>
      <header
        className="page-header"
        style={{ padding: 0, border: "none", marginBottom: "1.5rem" }}
      >
        <h1>Categorias (Gêneros)</h1>
        <p>
          Cadastre os gêneros usados para classificar filmes e séries. Evite
          duplicar nomes.
        </p>
      </header>
      <GenresList
        initial={genres.map((g) => ({
          id: g.id,
          name: g.name,
          slug: g.slug,
          moviesCount: g._count.movies,
          seriesCount: g._count.series,
        }))}
      />
    </div>
  );
}
