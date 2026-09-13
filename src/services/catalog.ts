import { prisma } from "../lib/prisma";
import type { HeroSlideItem, MovieListItem, SeriesListItem } from "../types/content";

const MOVIE_INCLUDE = {
  genres: true,
} as const;

const SERIES_INCLUDE = {
  genres: true,
} as const;

export async function getFeaturedSlides(): Promise<HeroSlideItem[]> {
  const [movies, series] = await Promise.all([
    prisma.movie.findMany({
      where: { featured: true, published: true },
      include: { ...MOVIE_INCLUDE, files: true },
      orderBy: { order: "asc" },
    }),
    prisma.series.findMany({
      where: { featured: true, published: true },
      include: { ...SERIES_INCLUDE, seasons: { include: { episodes: { include: { files: true } } } } },
      orderBy: { order: "asc" },
    }),
  ]);

  const slides: HeroSlideItem[] = [];

  for (const m of movies) {
    slides.push({
      id: m.id,
      slug: m.slug,
      type: "movie",
      title: m.title,
      year: m.year,
      rating: m.rating,
      overview: m.overview,
      backdrop: m.backdrop,
      poster: m.poster,
      genres: m.genres.map((g) => g.name),
      hasDownload: m.files.length > 0,
    });
  }

  for (const s of series) {
    slides.push({
      id: s.id,
      slug: s.slug,
      type: "series",
      title: s.title,
      year: s.year,
      rating: s.rating,
      overview: s.overview,
      backdrop: s.backdrop,
      poster: s.poster,
      genres: s.genres.map((g) => g.name),
      hasDownload: s.seasons.some((season) =>
        season.episodes.some((ep) => ep.files.length > 0),
      ),
    });
  }

  return slides.slice(0, 6);
}

export async function getLatestMovies(limit = 10): Promise<MovieListItem[]> {
  const items = await prisma.movie.findMany({
    where: { published: true },
    include: MOVIE_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return items.map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    year: m.year,
    rating: m.rating,
    poster: m.poster,
    genres: m.genres,
  }));
}

export async function getLatestSeries(limit = 10): Promise<SeriesListItem[]> {
  const items = await prisma.series.findMany({
    where: { published: true },
    include: SERIES_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return items.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    year: s.year,
    rating: s.rating,
    poster: s.poster,
    genres: s.genres,
  }));
}

export async function getAllGenres() {
  return prisma.genre.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getSiteSettings() {
  const settings = await prisma.settings.findFirst();
  return (
    settings ?? {
      id: "",
      siteName: "Playcinix",
      siteDescription: null,
      facebookUrl: null,
      twitterUrl: null,
      instagramUrl: null,
      telegramUrl: null,
      whatsappNumber: null,
    }
  );
}
