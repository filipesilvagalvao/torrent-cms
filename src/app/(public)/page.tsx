import { 
  getFeaturedSlides, 
  getLatestMovies, 
  getLatestSeries 
} from "../../services/catalog";
import HeroSlider from "../../components/sections/HeroSlider";
import MediaGridSection from "../../components/sections/MediaGridSection";

export const dynamic = "force-static";

export default async function HomePage() {
  const [slides, latestMovies, latestSeries] = await Promise.all([
    getFeaturedSlides(),
    getLatestMovies(10),
    getLatestSeries(10),
  ]);

  return (
    <>
      <HeroSlider slides={slides} />
      <MediaGridSection
        title="Últimos filmes adicionados"
        type="movie"
        items={latestMovies}
        seeAllHref="/filmes"
      />
      <MediaGridSection
        title="Últimas séries adicionadas"
        type="series"
        items={latestSeries}
        seeAllHref="/series"
      />
    </>
  );
}
