import { notFound } from "next/navigation";
import { getSeasonById } from "../../../../../services/series";
import SeasonEditor from "../../../../../components/admin/SeasonEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar temporada" };

type Params = { id: string };

export default async function EditSeasonPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const season = await getSeasonById(id);
  if (!season) notFound();

  return (
    <div>
      <header
        className="page-header"
        style={{ padding: 0, border: "none", marginBottom: "1.5rem" }}
      >
        <h1>Temporada {season.number}</h1>
        <p>
          Série:{" "}
          <a
            href={`/admin/series/${season.seriesId}/editar`}
            style={{ color: "var(--main-color)" }}
          >
            {season.series.title}
          </a>
        </p>
      </header>
      <SeasonEditor
        season={{
          id: season.id,
          number: season.number,
          title: season.title,
          overview: season.overview,
          poster: season.poster,
          releaseDate: season.releaseDate
            ? season.releaseDate.toISOString().slice(0, 10)
            : null,
          episodes: season.episodes.map((ep) => ({
            id: ep.id,
            number: ep.number,
            title: ep.title,
            runtime: ep.runtime,
          })),
        }}
      />
    </div>
  );
}
