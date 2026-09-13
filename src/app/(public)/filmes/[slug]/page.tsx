import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faClock,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import { getMovieBySlug, getRelatedMovies } from "../../../../services/movies";
import { formatRuntime } from "../../../../lib/utils";
import { absoluteUrl, contentMetadata } from "../../../../lib/seo";
import Rating from "../../../../components/media/Rating";
import ShareButtons from "../../../../components/media/ShareButtons";
import WatchlistButton from "../../../../components/media/WatchlistButton";
import CommentList from "../../../../components/media/CommentList";
import CommentForm from "../../../../components/media/CommentForm";
import MediaGridSection from "../../../../components/sections/MediaGridSection";
import JsonLd from "../../../../components/seo/JsonLd";

type Params = { slug: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);
  if (!movie) return { title: "Filme não encontrado" };
  return contentMetadata({
    title: movie.title,
    description: movie.overview,
    image: movie.poster,
    url: `/filmes/${movie.slug}`,
    type: "video.movie",
    publishedTime: movie.releaseDate?.toISOString(),
  });
}

function getYouTubeId(url: string | null): string | null {
  if (!url) return null;
  const m =
    url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([^"&?\/\s]{11})/) ??
    url.match(/youtu\.be\/([^"&?\/\s]{11})/);
  return m ? m[1] : null;
}

function isoDuration(minutes: number | null): string | null {
  if (!minutes) return null;
  return `PT${minutes}M`;
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);
  if (!movie) notFound();

  const related = await getRelatedMovies(
    movie.id,
    movie.genres.map((g) => g.id),
    8,
  );

  const trailerId = getYouTubeId(movie.trailer);
  const pageUrl = `/filmes/${movie.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Movie",
        name: movie.title,
        alternateName: movie.originalTitle ?? undefined,
        description: movie.overview ?? undefined,
        image: movie.poster ? absoluteUrl(movie.poster) : undefined,
        datePublished: movie.releaseDate?.toISOString(),
        director: undefined,
        genre: movie.genres.map((g) => g.name),
        inLanguage: movie.languages ?? undefined,
        duration: isoDuration(movie.runtime),
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
            name: "Filmes",
            item: absoluteUrl("/filmes"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: movie.title,
            item: absoluteUrl(pageUrl),
          },
        ],
      },
    ],
  };

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
        {movie.backdrop ? (
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <Image
              src={movie.backdrop}
              alt={movie.title}
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
            {movie.poster ? (
              <Image
                src={movie.poster}
                alt={movie.title}
                fill
                sizes="200px"
              />
            ) : null}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <span className="pill" style={{ alignSelf: "flex-start" }}>
              Filme
            </span>
            <h1 style={{ fontSize: "2.2rem", color: "var(--text-color-1)" }}>
              {movie.title}
            </h1>
            {movie.originalTitle && movie.originalTitle !== movie.title ? (
              <p style={{ color: "var(--light-text)", margin: 0 }}>
                Título original: {movie.originalTitle}
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
              {movie.year ? (
                <span className="pill pill--neutral">{movie.year}</span>
              ) : null}
              {movie.classification ? (
                <span className="pill pill--neutral">{movie.classification}</span>
              ) : null}
              {movie.runtime ? (
                <span className="pill pill--neutral">
                  <FontAwesomeIcon icon={faClock} /> {formatRuntime(movie.runtime)}
                </span>
              ) : null}
              <Rating value={movie.rating} size="md" />
            </div>
            {movie.languages ? (
              <p style={{ color: "var(--light-text)", margin: 0 }}>
                Idiomas: {movie.languages}
              </p>
            ) : null}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <WatchlistButton id={movie.id} type="movie" title={movie.title} />
              <ShareButtons url={pageUrl} text={movie.title} />
            </div>
            {movie.genres.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {movie.genres.map((g) => (
                  <Link key={g.id} href={`/categorias/${g.slug}`} className="pill">
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
          {movie.overview ? (
            <article>
              <h2 style={{ marginBottom: "0.75rem" }}>Sinopse</h2>
              <p
                style={{
                  color: "var(--text-color-2)",
                  fontSize: "1rem",
                  lineHeight: 1.7,
                }}
              >
                {movie.overview}
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
                  title={`Trailer de ${movie.title}`}
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

      <section id="downloads" className="section">
        <div className="container">
          <h2 style={{ marginBottom: "1rem" }}>Arquivos para download</h2>
          {movie.files.length === 0 ? (
            <div className="empty-state">
              <h3>Em breve</h3>
              <p>Nenhum arquivo cadastrado para este filme.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {movie.files.map((f) => (
                <div
                  key={f.id}
                  style={{
                    background: "var(--bg-color-2)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem 1.25rem",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {f.name ? (
                      <strong style={{ color: "var(--text-color-1)" }}>{f.name}</strong>
                    ) : null}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        fontSize: "0.85rem",
                        color: "var(--light-text)",
                      }}
                    >
                      {f.resolution || f.quality ? (
                        <span>{f.resolution || f.quality}</span>
                      ) : null}
                      {f.format ? <span>• {f.format}</span> : null}
                      {f.language ? <span>• {f.language}</span> : null}
                      {f.subtitle ? <span>• Leg: {f.subtitle}</span> : null}
                      {f.size ? <span>• {f.size}</span> : null}
                    </div>
                  </div>
                  <a
                    href={f.link}
                    className="btn btn--primary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                    Baixar
                  </a>
                </div>
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
            Compartilhe sua opinião sobre este filme.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <CommentForm type="movie" itemId={movie.id} />
            <CommentList
              comments={movie.comments}
              emptyMessage="Seja o primeiro a comentar."
            />
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <MediaGridSection
          title="Você também pode gostar"
          type="movie"
          items={related.map((m) => ({
            id: m.id,
            slug: m.slug,
            title: m.title,
            year: m.year,
            rating: m.rating,
            poster: m.poster,
            genres: m.genres,
          }))}
          emptyMessage="Sem conteúdos relacionados."
        />
      ) : null}
    </>
  );
}
