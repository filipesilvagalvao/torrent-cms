import "server-only";
import { prisma } from "../lib/prisma";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

async function getApiKey(): Promise<string | null> {
  if (process.env.TMDB_API_KEY && process.env.TMDB_API_KEY.trim().length > 0) {
    return process.env.TMDB_API_KEY.trim();
  }
  try {
    const settings = await prisma.settings.findFirst();
    if (settings?.tmdbApiKey && settings.tmdbApiKey.trim().length > 0) {
      return settings.tmdbApiKey.trim();
    }
  } catch {
    // Ignora erro de banco em build time
  }
  return null;
}

export function tmdbImage(
  path: string | null | undefined,
  size: "original" | "w500" | "w780" = "original",
): string | null {
  if (!path) return null;
  return `${IMG_BASE}/${size}${path.startsWith("/") ? path : "/" + path}`;
}

type TmdbGenre = { id: number; name: string };

type TmdbMovie = {
  id: number;
  title: string;
  original_title: string;
  overview: string | null;
  release_date: string | null;
  vote_average: number;
  runtime: number | null;
  poster_path: string | null;
  backdrop_path: string | null;
  original_language: string | null;
  spoken_languages: Array<{ iso_639_1: string; name: string }>;
  genres: TmdbGenre[];
};

type TmdbSeries = {
  id: number;
  name: string;
  original_name: string;
  overview: string | null;
  first_air_date: string | null;
  last_air_date: string | null;
  vote_average: number;
  episode_run_time: number[];
  poster_path: string | null;
  backdrop_path: string | null;
  original_language: string | null;
  spoken_languages: Array<{ iso_639_1: string; name: string }>;
  genres: TmdbGenre[];
  number_of_seasons: number;
  number_of_episodes: number;
};

function extractYear(date: string | null | undefined): number | null {
  if (!date) return null;
  const year = parseInt(date.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

function joinLanguages(list: Array<{ name: string }> | null | undefined): string | null {
  if (!list || list.length === 0) return null;
  const names = list.map((l) => l.name).filter(Boolean);
  return names.length > 0 ? names.join(", ") : null;
}

async function tmdbFetch<T>(
  path: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<T> {
  const separator = path.includes("?") ? "&" : "?";
  const url = `${TMDB_BASE}${path}${separator}api_key=${encodeURIComponent(apiKey)}&language=pt-BR`;
  const res = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `TMDB request failed (${res.status} ${res.statusText}): ${text.slice(0, 200)}`,
    );
  }
  return (await res.json()) as T;
}

export type ImportedMovie = {
  tmdbId: number;
  title: string;
  originalTitle: string | null;
  overview: string | null;
  year: number | null;
  rating: number | null;
  runtime: number | null;
  languages: string | null;
  poster: string | null;
  backdrop: string | null;
  genres: string[];
};

export type ImportedSeries = {
  tmdbId: number;
  title: string;
  originalTitle: string | null;
  overview: string | null;
  year: number | null;
  rating: number | null;
  runtime: number | null;
  languages: string | null;
  poster: string | null;
  backdrop: string | null;
  genres: string[];
};

export type TmdbImportResult = {
  type: "movie" | "series";
  movie?: ImportedMovie;
  series?: ImportedSeries;
};

export async function importFromTmdb(
  type: "movie" | "series",
  tmdbId: number,
): Promise<TmdbImportResult> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error(
      "TMDB API Key não configurada. Defina em /admin/configuracoes.",
    );
  }

  if (type === "movie") {
    const data = await tmdbFetch<TmdbMovie>(
      `/movie/${encodeURIComponent(String(tmdbId))}`,
      apiKey,
    );
    const result: ImportedMovie = {
      tmdbId: data.id,
      title: data.title,
      originalTitle: data.original_title ?? null,
      overview: data.overview ?? null,
      year: extractYear(data.release_date),
      rating: data.vote_average ?? null,
      runtime: data.runtime ?? null,
      languages:
        joinLanguages(data.spoken_languages) ?? data.original_language ?? null,
      poster: tmdbImage(data.poster_path, "w500"),
      backdrop: tmdbImage(data.backdrop_path, "original"),
      genres: (data.genres ?? []).map((g) => g.name),
    };
    return { type: "movie", movie: result };
  }

  const data = await tmdbFetch<TmdbSeries>(
    `/tv/${encodeURIComponent(String(tmdbId))}`,
    apiKey,
  );
  const runtime =
    Array.isArray(data.episode_run_time) && data.episode_run_time.length > 0
      ? data.episode_run_time[0]
      : null;
  const result: ImportedSeries = {
    tmdbId: data.id,
    title: data.name,
    originalTitle: data.original_name ?? null,
    overview: data.overview ?? null,
    year: extractYear(data.first_air_date),
    rating: data.vote_average ?? null,
    runtime,
    languages:
      joinLanguages(data.spoken_languages) ?? data.original_language ?? null,
    poster: tmdbImage(data.poster_path, "w500"),
    backdrop: tmdbImage(data.backdrop_path, "original"),
    genres: (data.genres ?? []).map((g) => g.name),
  };
  return { type: "series", series: result };
}

export async function isTmdbConfigured(): Promise<boolean> {
  const key = await getApiKey();
  return Boolean(key);
}
