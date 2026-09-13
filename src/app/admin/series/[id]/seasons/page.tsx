import { notFound } from "next/navigation";
import { getSeriesById } from "../../../../../services/series";
import SeasonsManager from "../../../../../components/admin/SeasonsManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Temporadas" };

type Params = { id: string };

export default async function AdminSeriesSeasonsPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const series = await getSeriesById(id);
  if (!series) notFound();

  return (
    <div>
      <header
        className="page-header"
        style={{ padding: 0, border: "none", marginBottom: "1.5rem" }}
      >
        <h1>Temporadas de {series.title}</h1>
        <p>Adicione, edite e remova temporadas desta série.</p>
      </header>
      <SeasonsManager
        seriesId={series.id}
        seriesTitle={series.title}
        seriesSlug={series.slug}
        initial={series.seasons.map((s) => ({
          id: s.id,
          number: s.number,
          title: s.title,
          overview: s.overview,
          poster: s.poster,
          releaseDate: s.releaseDate ? s.releaseDate.toISOString() : null,
          episodes: s.episodes.map((ep) => ({
            id: ep.id,
            number: ep.number,
            title: ep.title,
            runtime: ep.runtime,
            filesCount: ep._count.files,
          })),
        }))}
      />
    </div>
  );
}
