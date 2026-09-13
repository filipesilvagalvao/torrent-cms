import { notFound } from "next/navigation";
import { getEpisodeById } from "../../../../../services/series";
import EpisodeForm from "../../../../../components/admin/EpisodeForm";
import type { FileDraft } from "../../../../../components/admin/FileEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar episódio" };

type Params = { id: string };

export default async function EditEpisodePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const episode = await getEpisodeById(id);
  if (!episode) notFound();

  const seasonsHref = `/admin/seasons/${episode.seasonId}/editar`;

  const files: FileDraft[] = episode.files.map((f) => ({
    id: f.id,
    name: f.name ?? "",
    quality: f.quality ?? "",
    resolution: f.resolution ?? "",
    format: f.format ?? "",
    language: f.language ?? "",
    subtitle: f.subtitle ?? "",
    size: f.size ?? "",
    link: f.link,
  }));

  return (
    <div>
      <header
        className="page-header"
        style={{ padding: 0, border: "none", marginBottom: "1.5rem" }}
      >
        <h1>Episódio {episode.number}</h1>
        <p>
          Série:{" "}
          <a
            href={`/admin/series/${episode.season.series.id}/editar`}
            style={{ color: "var(--main-color)" }}
          >
            {episode.season.series.title}
          </a>{" "}
          · Temporada {episode.season.number}
        </p>
      </header>
      <EpisodeForm
        mode="edit"
        seasonId={episode.seasonId}
        seasonsHref={seasonsHref}
        initial={{
          id: episode.id,
          number: episode.number,
          title: episode.title,
          overview: episode.overview,
          runtime: episode.runtime,
          airDate: episode.airDate ? episode.airDate.toISOString().slice(0, 10) : null,
          stillImage: episode.stillImage,
          files,
        }}
      />
    </div>
  );
}
