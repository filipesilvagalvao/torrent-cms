import { notFound } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { getSeriesById } from "../../../../../services/series";
import { getAllGenres } from "../../../../../services/catalog";
import SeriesForm from "../../../../../components/admin/SeriesForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar série" };

type Params = { id: string };

export default async function EditSeriesPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const [series, genres] = await Promise.all([
    getSeriesById(id),
    getAllGenres(),
  ]);
  if (!series) notFound();

  return (
    <div>
      <header
        className="page-header"
        style={{ padding: 0, border: "none", marginBottom: "1.5rem" }}
      >
        <h1>Editar série</h1>
        <p>Atualize as informações da série ou reimporte do TMDB.</p>
      </header>
      <SeriesForm
        mode="edit"
        genres={genres}
        initial={{
          id: series.id,
          tmdbId: series.tmdbId,
          title: series.title,
          originalTitle: series.originalTitle,
          slug: series.slug,
          overview: series.overview,
          year: series.year,
          rating: series.rating,
          classification: series.classification,
          poster: series.poster,
          backdrop: series.backdrop,
          trailer: series.trailer,
          languages: series.languages,
          featured: series.featured,
          published: series.published,
          order: series.order,
          genreIds: series.genres.map((g) => g.id),
        }}
        onSubmitRedirect={`/admin/series/${id}/seasons`}
      />

      <aside
        style={{
          marginTop: "1.5rem",
          background: "var(--bg-color-2)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <strong style={{ color: "var(--text-color-1)" }}>
            <FontAwesomeIcon icon={faLayerGroup} /> {series.seasons.length} temporada(s)
          </strong>
          <p style={{ color: "var(--light-text)", margin: "0.25rem 0 0" }}>
            Gerencie temporadas, episódios e arquivos de cada episódio.
          </p>
        </div>
        <Link
          href={`/admin/series/${id}/seasons`}
          className="btn btn--primary"
        >
          Gerenciar temporadas
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </aside>
    </div>
  );
}
