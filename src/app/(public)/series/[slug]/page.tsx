import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faChevronDown,
  faClock,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import {
  getRelatedSeries,
  getSeriesBySlug,
} from "../../../../services/series";
import { absoluteUrl, contentMetadata } from "../../../../lib/seo";
import Rating from "../../../../components/media/Rating";
import ShareButtons from "../../../../components/media/ShareButtons";
import WatchlistButton from "../../../../components/media/WatchlistButton";
import CommentList from "../../../../components/media/CommentList";
import CommentForm from "../../../../components/media/CommentForm";
import MediaGridSection from "../../../../components/sections/MediaGridSection";
import JsonLd from "../../../../components/seo/JsonLd";

type Params = { slug: string };

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) return { title: "Série não encontrada" };
  return contentMetadata({
    title: series.title,
    description: series.overview,
    image: series.poster,
    url: `/series/${series.slug}`,
    type: "video.tv_show",
    publishedTime: series.releaseDate?.toISOString(),
  });
}

function getYouTubeId(url: string | null): string | null {
  if (!url) return null;
  const m =
    url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([^"&?\/\s]{11})/) ??
    url.match(/youtu\.be\/([^"&?\/\s]{11})/);
  return m ? m[1] : null;
}

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) notFound();

  const related = await getRelatedSeries(
    series.id,
    series.genres.map((g) => g.id),
    8,
  );

  const trailerId = getYouTubeId(series.trailer);
  const pageUrl = `/series/${series.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TVSeries",
        name: series.title,
        alternateName: series.originalTitle ?? undefined,
        description: series.overview ?? undefined,
        image: series.poster ? absoluteUrl(series.poster) : undefined,
        datePublished: series.releaseDate?.toISOString(),
        genre: series.genres.map((g) => g.name),
        inLanguage: series.languages ?? undefined,
        numberOfSeasons: series.seasons.length,
        numberOfEpisodes: series.seasons.reduce(
          (acc, s) => acc + s.episodes.length,
          0,
        ),
        url: absoluteUrl(pageUrl),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Início",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Séries",
            item: absoluteUrl("/series"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: series.title,
            item: absoluteUrl(pageUrl),
          },
        ],
      },
    ],
  };

  const episodesCount = series.seasons.reduce(
    (acc, s) => acc + s.episodes.length,
    0,
  );
  const totalFiles = series.seasons.reduce(
    (acc, s) =>
      acc + s.episodes.reduce((sum, ep) => sum + ep.files.length, 0),
    0,
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <header
        style={{
          position: "relative",
          minHeight: 320,
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        {series.backdrop ? (
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <Image
              src={series.backdrop}
              alt={series.title}
              fill
              sizes="100vw"
              priority
              style={{ objectFit: "cover", filter: "brightness(0.45)" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(2,9,22,0.2) 0%, rgba(2,9,22,0.95) 100%)",
              }}
            />
          </div>
        ) : null}
        <div
          className="container"
          style={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            gap: "2rem",
            padding: "3rem 1.25rem",
          }}
        >
          <div
            style={{
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              boxShadow: "var(--shadow-2)",
              aspectRatio: "2 / 3",
              position: "relative",
            }}
          >
            {series.poster ? (
              <Image
                src={series.poster}
                alt={series.title}
                fill
                sizes="200px"
              />
            ) : null}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <span className="pill" style={{ alignSelf: "flex-start" }}>
              Série
            </span>
            <h1 style={{ fontSize: "2.2rem", color: "var(--text-color-1)" }}>
              {series.title}
            </h1>
            {series.originalTitle &&
            series.originalTitle !== series.title ? (
              <p style={{ color: "var(--light-text)", margin: 0 }}>
                Título original: {series.originalTitle}
              </p>
            ) : null}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              {series.year ? (
                <span className="pill pill--neutral">{series.year}</span>
              ) : null}
              {series.classification ? (
                <span className="pill pill--neutral">
                  {series.classification}
                </span>
              ) : null}
              <span className="pill pill--neutral">
                {series.seasons.length} temporada(s)
              </span>
              <span className="pill pill--neutral">
                {episodesCount} episódio(s)
              </span>
              <Rating value={series.rating} size="md" />
            </div>
            {series.languages ? (
              <p style={{ color: "var(--light-text)", margin: 0 }}>
                Idiomas: {series.languages}
              </p>
            ) : null}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <WatchlistButton id={series.id} type="series" title={series.title} />
              <ShareButtons url={pageUrl} text={series.title} />
            </div>
            {series.genres.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {series.genres.map((g) => (
                  <Link
                    key={g.id}
                    href={`/categorias/${g.slug}`}
                    className="pill"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <section className="section section--tight">
        <div className="container">
          {series.overview ? (
            <article>
              <h2 style={{ marginBottom: "0.75rem" }}>Sinopse</h2>
              <p
                style={{
                  color: "var(--text-color-2)",
                  fontSize: "1rem",
                  lineHeight: 1.7,
                }}
              >
                {series.overview}
              </p>
            </article>
          ) : null}

          {trailerId ? (
            <article style={{ marginTop: "2rem" }}>
              <h2 style={{ marginBottom: "0.75rem" }}>Trailer</h2>
              <div
                style={{
                  position: "relative",
                  aspectRatio: "16 / 9",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  background: "var(--bg-color-2)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${trailerId}`}
                  title={`Trailer de ${series.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: 0,
                  }}
                />
              </div>
            </article>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <h2>Temporadas e episódios</h2>
            <span style={{ color: "var(--light-text)", fontSize: "0.9rem" }}>
              {totalFiles} arquivo(s) disponível(is)
            </span>
          </div>
          {series.seasons.length === 0 ? (
            <div className="empty-state">
              <h3>Em breve</h3>
              <p>Nenhuma temporada cadastrada.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {series.seasons.map((season) => (
                <SeasonBlock
                  key={season.id}
                  seriesSlug={series.slug}
                  season={{
                    id: season.id,
                    number: season.number,
                    title: season.title,
                    overview: season.overview,
                    episodes: season.episodes.map((ep) => ({
                      id: ep.id,
                      number: ep.number,
                      title: ep.title,
                      overview: ep.overview,
                      runtime: ep.runtime,
                      airDate: ep.airDate ? ep.airDate.toISOString() : null,
                      files: ep.files.map((f) => ({
                        id: f.id,
                        name: f.name,
                        quality: f.quality,
                        resolution: f.resolution,
                        format: f.format,
                        language: f.language,
                        subtitle: f.subtitle,
                        size: f.size,
                        link: f.link,
                      })),
                    })),
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 style={{ marginBottom: "0.5rem" }}>
            <FontAwesomeIcon icon={faCommentDots} /> Comentários
          </h2>
          <p style={{ color: "var(--light-text)", marginBottom: "1rem" }}>
            Compartilhe sua opinião sobre esta série.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <CommentForm type="series" itemId={series.id} />
            <CommentList
              comments={series.comments}
              emptyMessage="Seja o primeiro a comentar."
            />
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <MediaGridSection
          title="Séries relacionadas"
          type="series"
          items={related.map((s) => ({
            id: s.id,
            slug: s.slug,
            title: s.title,
            year: s.year,
            rating: s.rating,
            poster: s.poster,
            genres: s.genres,
          }))}
          emptyMessage="Sem séries relacionadas."
        />
      ) : null}
    </>
  );
}

type SeasonBlockProps = {
  seriesSlug: string;
  season: {
    id: string;
    number: number;
    title: string | null;
    overview: string | null;
    episodes: Array<{
      id: string;
      number: number;
      title: string;
      overview: string | null;
      runtime: number | null;
      airDate: string | null;
      files: Array<{
        id: string;
        name: string | null;
        quality: string | null;
        resolution: string | null;
        format: string | null;
        language: string | null;
        subtitle: string | null;
        size: string | null;
        link: string;
      }>;
    }>;
  };
};

function SeasonBlock({ season }: SeasonBlockProps) {
  return (
    <details
      open
      style={{
        background: "var(--bg-color-2)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
      }}
    >
      <summary
        style={{
          listStyle: "none",
          cursor: "pointer",
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "var(--text-color-1)",
          gap: "0.5rem",
        }}
      >
        <div>
          <span className="pill">Temporada {season.number}</span>
          {season.title ? (
            <strong style={{ marginLeft: "0.5rem" }}>{season.title}</strong>
          ) : null}
        </div>
        <FontAwesomeIcon icon={faChevronDown} style={{ color: "var(--light-text)" }} />
      </summary>
      {season.overview ? (
        <p
          style={{
            margin: "0 1.25rem 0.75rem",
            color: "var(--light-text)",
            fontSize: "0.9rem",
          }}
        >
          {season.overview}
        </p>
      ) : null}
      {season.episodes.length === 0 ? (
        <p
          style={{
            padding: "0 1.25rem 1rem",
            color: "var(--light-text)",
            margin: 0,
          }}
        >
          Nenhum episódio cadastrado.
        </p>
      ) : (
        <div
          style={{
            padding: "0 1.25rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {season.episodes.map((ep) => (
            <EpisodeRow key={ep.id} episode={ep} />
          ))}
        </div>
      )}
    </details>
  );
}

function EpisodeRow({
  episode,
}: {
  episode: SeasonBlockProps["season"]["episodes"][number];
}) {
  return (
    <div
      style={{
        background: "var(--bg-color-1)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "0.85rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
          alignItems: "baseline",
        }}
      >
        <strong style={{ color: "var(--text-color-1)" }}>
          E{episode.number} · {episode.title}
        </strong>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            color: "var(--light-text)",
            fontSize: "0.8rem",
          }}
        >
          {episode.runtime ? (
            <span>
              <FontAwesomeIcon icon={faClock} /> {episode.runtime} min
            </span>
          ) : null}
          {episode.files.length > 0 ? (
            <span>{episode.files.length} arquivo(s)</span>
          ) : null}
        </div>
      </div>
      {episode.overview ? (
        <p
          style={{
            margin: 0,
            color: "var(--text-color-2)",
            fontSize: "0.9rem",
            lineHeight: 1.5,
          }}
        >
          {episode.overview}
        </p>
      ) : null}
      {episode.files.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
          }}
        >
          {episode.files.map((f) => (
            <div
              key={f.id}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--bg-color-2)",
                borderRadius: "var(--radius-sm)",
                padding: "0.5rem 0.75rem",
              }}
            >
              <div
                style={{
                  color: "var(--light-text)",
                  fontSize: "0.85rem",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                {f.resolution || f.quality ? (
                  <span style={{ color: "var(--text-color-1)" }}>
                    {f.resolution || f.quality}
                  </span>
                ) : null}
                {f.format ? <span>• {f.format}</span> : null}
                {f.language ? <span>• {f.language}</span> : null}
                {f.subtitle ? <span>• Leg: {f.subtitle}</span> : null}
                {f.size ? <span>• {f.size}</span> : null}
              </div>
              <a
                href={f.link}
                className="btn btn--primary"
                target="_blank"
                rel="noreferrer"
                style={{ padding: "0.4rem 0.85rem" }}
              >
                <FontAwesomeIcon icon={faDownload} /> Baixar
              </a>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
