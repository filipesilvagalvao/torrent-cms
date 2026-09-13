import { getLatestMovies } from "../../../services/catalog";
import MediaGridSection from "../../../components/sections/MediaGridSection";

export const dynamic = "force-static";

export const metadata = {
  title: "Filmes",
  description: "Catálogo completo de filmes disponíveis no Playcinix.",
};

export default async function MoviesPage() {
  const movies = await getLatestMovies(50);
  return (
    <MediaGridSection
      title="Filmes"
      type="movie"
      items={movies}
      emptyMessage="Nenhum filme publicado ainda."
    />
  );
}
