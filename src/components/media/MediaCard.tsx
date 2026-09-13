import Link from "next/link";
import Image from "next/image";
import Rating from "./Rating";
import WatchlistButton from "./WatchlistButton";
import type { MovieListItem, SeriesListItem } from "../../types/content";

type Props = {
  item: MovieListItem | SeriesListItem;
  type: "movie" | "series";
};

export default function MediaCard({ item, type }: Props) {
  const href =
    type === "movie" ? `/filmes/${item.slug}` : `/series/${item.slug}`;
  return (
    <Link href={href} className="media-card">
      <div className="media-card__poster">
        {item.poster ? (
          <Image
            src={item.poster}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, 220px"
          />
        ) : (
          <div
            aria-label={item.title}
            style={{
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(135deg, var(--bg-color-2), var(--bg-color-1))",
            }}
          />
        )}
        <span className="media-card__badge">
          {type === "movie" ? "Filme" : "Série"}
        </span>
      </div>
      <div className="media-card__body">
        <h3 className="media-card__title">{item.title}</h3>
        <div className="media-card__meta">
          <span>{item.year ?? "—"}</span>
          <span aria-hidden="true">·</span>
          <Rating value={item.rating} showTmdbLabel={false} />
        </div>
        <div className="media-card__actions">
          <span className="pill pill--neutral">
            {item.genres[0]?.name ?? "Catálogo"}
          </span>
          <WatchlistButton id={item.id} type={type} title={item.title} />
        </div>
      </div>
    </Link>
  );
}
