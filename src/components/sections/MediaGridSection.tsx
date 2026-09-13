import Link from "next/link";
import MediaCard from "../media/MediaCard";
import type { MovieListItem, SeriesListItem } from "../../types/content";

type Props = {
  title: string;
  type: "movie" | "series";
  items: MovieListItem[] | SeriesListItem[];
  seeAllHref?: string;
  emptyMessage?: string;
};

export default function MediaGridSection({
  title,
  type,
  items,
  seeAllHref,
  emptyMessage,
}: Props) {
  return (
    <section className="section">
      <div className="container">
        <div className="section-title">
          <h2>{title}</h2>
          {seeAllHref ? <Link href={seeAllHref}>Ver todos</Link> : null}
        </div>
        {items.length === 0 ? (
          <div className="empty-state">
            <h3>Em breve</h3>
            <p>{emptyMessage ?? `Ainda não há ${type === "movie" ? "filmes" : "séries"} cadastrados.`}</p>
          </div>
        ) : (
          <div className="media-grid">
            {items.map((item) => (
              <MediaCard key={item.id} item={item} type={type} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
