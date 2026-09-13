import { getLatestSeries } from "../../../services/catalog";
import MediaGridSection from "../../../components/sections/MediaGridSection";

export const dynamic = "force-static";

export const metadata = {
  title: "Séries",
  description: "Catálogo completo de séries disponíveis no Playcinix.",
};

export default async function SeriesPage() {
  const series = await getLatestSeries(50);
  return (
    <MediaGridSection
      title="Séries"
      type="series"
      items={series}
      emptyMessage="Nenhuma série publicada ainda."
    />
  );
}
