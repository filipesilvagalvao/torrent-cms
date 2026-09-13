import { notFound } from "next/navigation";
import { getMovieById } from "../../../../../services/movies";
import { getAllGenres } from "../../../../../services/catalog";
import MovieForm from "../../../../../components/admin/MovieForm";
import type { FileDraft } from "../../../../../components/admin/FileEditor";

export const dynamic = "force-dynamic";

export const metadata = { title: "Editar filme" };

type Params = { id: string };

export default async function EditMoviePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const [movie, genres] = await Promise.all([
    getMovieById(id),
    getAllGenres(),
  ]);
  if (!movie) notFound();

  const files: FileDraft[] = movie.files.map((f) => ({
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
        <h1>Editar filme</h1>
        <p>Atualize as informações ou reimporte os dados do TMDB.</p>
      </header>
      <MovieForm
        mode="edit"
        genres={genres}
        initial={{
          id: movie.id,
          tmdbId: movie.tmdbId,
          title: movie.title,
          originalTitle: movie.originalTitle,
          slug: movie.slug,
          overview: movie.overview,
          year: movie.year,
          rating: movie.rating,
          classification: movie.classification,
          poster: movie.poster,
          backdrop: movie.backdrop,
          trailer: movie.trailer,
          runtime: movie.runtime,
          languages: movie.languages,
          featured: movie.featured,
          published: movie.published,
          order: movie.order,
          genreIds: movie.genres.map((g) => g.id),
          files,
        }}
      />
    </div>
  );
}
