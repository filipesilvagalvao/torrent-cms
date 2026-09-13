import { prisma } from "../lib/prisma";
import { slugify } from "../lib/utils";
import type { SeriesInput, SeasonInput, EpisodeInput } from "../lib/validators";

const SERIES_INCLUDE = {
  genres: { select: { id: true, name: true, slug: true } },
  seasons: {
    orderBy: { number: "asc" as const },
    include: {
      episodes: {
        orderBy: { number: "asc" as const },
        include: { _count: { select: { files: true } } },
      },
    },
  },
  _count: { select: { seasons: true, comments: true } },
} as const;

export type AdminSeriesRow = {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  year: number | null;
  rating: number | null;
  poster: string | null;
  backdrop: string | null;
  published: boolean;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  genres: Array<{ id: string; name: string; slug: string }>;
  seasonsCount: number;
  episodesCount: number;
  commentsCount: number;
};

export type AdminSeriesListParams = {
  q?: string;
  status?: "all" | "published" | "draft";
  genreId?: string;
  page?: number;
  pageSize?: number;
};

export async function listSeriesForAdmin(
  params: AdminSeriesListParams,
): Promise<{ items: AdminSeriesRow[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));

  const where = {
    ...(params.q
      ? {
          OR: [
            { title: { contains: params.q } },
            { originalTitle: { contains: params.q } },
            { slug: { contains: params.q } },
          ],
        }
      : {}),
    ...(params.status === "published" ? { published: true } : {}),
    ...(params.status === "draft" ? { published: false } : {}),
    ...(params.genreId ? { genres: { some: { id: params.genreId } } } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.series.count({ where }),
    prisma.series.findMany({
      where,
      include: {
        genres: { select: { id: true, name: true, slug: true } },
        _count: { select: { seasons: true, comments: true } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const episodeTotals = await Promise.all(
    items.map((s) =>
      prisma.episode.count({ where: { season: { seriesId: s.id } } }),
    ),
  );

  return {
    items: items.map((s, idx) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      originalTitle: s.originalTitle,
      year: s.year,
      rating: s.rating,
      poster: s.poster,
      backdrop: s.backdrop,
      published: s.published,
      featured: s.featured,
      order: s.order,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      genres: s.genres,
      seasonsCount: s._count.seasons,
      episodesCount: episodeTotals[idx],
      commentsCount: s._count.comments,
    })),
    total,
    page,
    pageSize,
  };
}

export async function getSeriesById(id: string) {
  return prisma.series.findUnique({
    where: { id },
    include: SERIES_INCLUDE,
  });
}

export async function getSeriesBySlug(slug: string) {
  return prisma.series.findUnique({
    where: { slug, published: true },
    include: {
      genres: true,
      seasons: {
        orderBy: { number: "asc" },
        include: {
          episodes: {
            orderBy: { number: "asc" },
            include: { files: { orderBy: { createdAt: "asc" } } },
          },
        },
      },
      comments: {
        where: { approved: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getRelatedSeries(
  seriesId: string,
  genreIds: string[],
  limit = 8,
) {
  return prisma.series.findMany({
    where: {
      published: true,
      id: { not: seriesId },
      ...(genreIds.length > 0
        ? { genres: { some: { id: { in: genreIds } } } }
        : {}),
    },
    include: { genres: true },
    orderBy: { rating: "desc" },
    take: limit,
  });
}

function buildSlug(input: SeriesInput): string {
  const base = (input.slug?.trim() || slugify(input.title))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base;
}

async function ensureUniqueSlug(
  base: string,
  currentId?: string,
): Promise<string> {
  let slug = base.length === 0 ? `serie-${Date.now()}` : base;
  let attempt = 0;
  while (true) {
    const existing = await prisma.series.findFirst({
      where: {
        slug,
        ...(currentId ? { id: { not: currentId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return slug;
    attempt += 1;
    slug = `${base}-${attempt + 1}`;
  }
}

export async function createSeries(input: SeriesInput) {
  const slug = await ensureUniqueSlug(buildSlug(input));
  return prisma.series.create({
    data: {
      tmdbId: input.tmdbId,
      title: input.title,
      originalTitle: input.originalTitle,
      slug,
      overview: input.overview,
      year: input.year,
      rating: input.rating,
      classification: input.classification,
      poster: input.poster,
      backdrop: input.backdrop,
      trailer: input.trailer,
      languages: input.languages,
      featured: input.featured,
      published: input.published,
      order: input.order,
      genres: input.genreIds.length
        ? { connect: input.genreIds.map((id) => ({ id })) }
        : undefined,
    },
  });
}

export async function updateSeries(id: string, input: SeriesInput) {
  const existing = await prisma.series.findUnique({ where: { id } });
  if (!existing) throw new Error("Série não encontrada");
  const slug = await ensureUniqueSlug(buildSlug(input), id);
  return prisma.series.update({
    where: { id },
    data: {
      tmdbId: input.tmdbId,
      title: input.title,
      originalTitle: input.originalTitle,
      slug,
      overview: input.overview,
      year: input.year,
      rating: input.rating,
      classification: input.classification,
      poster: input.poster,
      backdrop: input.backdrop,
      trailer: input.trailer,
      languages: input.languages,
      featured: input.featured,
      published: input.published,
      order: input.order,
      genres: { set: input.genreIds.map((id) => ({ id })) },
    },
  });
}

export async function deleteSeries(id: string) {
  await prisma.series.delete({ where: { id } });
}

export async function togglePublishSeries(id: string) {
  const s = await prisma.series.findUnique({ where: { id } });
  if (!s) throw new Error("Série não encontrada");
  return prisma.series.update({
    where: { id },
    data: { published: !s.published },
  });
}

export async function toggleFeatureSeries(id: string) {
  const s = await prisma.series.findUnique({ where: { id } });
  if (!s) throw new Error("Série não encontrada");
  return prisma.series.update({
    where: { id },
    data: { featured: !s.featured },
  });
}

// --- Seasons ---

export async function createSeason(seriesId: string, input: SeasonInput) {
  const exists = await prisma.season.findFirst({
    where: { seriesId, number: input.number },
  });
  if (exists) {
    throw new Error(`Já existe uma temporada ${input.number} nesta série.`);
  }
  return prisma.season.create({
    data: {
      seriesId,
      number: input.number,
      title: input.title,
      overview: input.overview,
      poster: input.poster,
      releaseDate: input.releaseDate ? new Date(input.releaseDate) : null,
    },
  });
}

export async function updateSeason(id: string, input: SeasonInput) {
  const season = await prisma.season.findUnique({ where: { id } });
  if (!season) throw new Error("Temporada não encontrada");
  const conflict = await prisma.season.findFirst({
    where: { seriesId: season.seriesId, number: input.number, id: { not: id } },
  });
  if (conflict) {
    throw new Error(`Já existe uma temporada ${input.number} nesta série.`);
  }
  return prisma.season.update({
    where: { id },
    data: {
      number: input.number,
      title: input.title,
      overview: input.overview,
      poster: input.poster,
      releaseDate: input.releaseDate ? new Date(input.releaseDate) : null,
    },
  });
}

export async function deleteSeason(id: string) {
  await prisma.season.delete({ where: { id } });
}

export async function getSeasonById(id: string) {
  return prisma.season.findUnique({
    where: { id },
    include: {
      series: { select: { id: true, title: true, slug: true } },
      episodes: { orderBy: { number: "asc" } },
    },
  });
}

// --- Episodes ---

export async function createEpisode(seasonId: string, input: EpisodeInput) {
  const season = await prisma.season.findUnique({ where: { id: seasonId } });
  if (!season) throw new Error("Temporada não encontrada");
  const exists = await prisma.episode.findFirst({
    where: { seasonId, number: input.number },
  });
  if (exists) {
    throw new Error(`Já existe um episódio ${input.number} nesta temporada.`);
  }
  return prisma.episode.create({
    data: {
      seasonId,
      number: input.number,
      title: input.title,
      overview: input.overview,
      runtime: input.runtime,
      airDate: input.airDate ? new Date(input.airDate) : null,
      stillImage: input.stillImage,
      files: input.files.length
        ? {
            create: input.files.map((f) => ({
              name: f.name,
              quality: f.quality,
              resolution: f.resolution,
              format: f.format,
              language: f.language,
              subtitle: f.subtitle,
              size: f.size,
              link: f.link,
            })),
          }
        : undefined,
    },
  });
}

export async function updateEpisode(id: string, input: EpisodeInput) {
  const episode = await prisma.episode.findUnique({ where: { id } });
  if (!episode) throw new Error("Episódio não encontrado");
  const conflict = await prisma.episode.findFirst({
    where: { seasonId: episode.seasonId, number: input.number, id: { not: id } },
  });
  if (conflict) {
    throw new Error(`Já existe um episódio ${input.number} nesta temporada.`);
  }
  await prisma.file.deleteMany({ where: { episodeId: id } });
  return prisma.episode.update({
    where: { id },
    data: {
      number: input.number,
      title: input.title,
      overview: input.overview,
      runtime: input.runtime,
      airDate: input.airDate ? new Date(input.airDate) : null,
      stillImage: input.stillImage,
      files: input.files.length
        ? {
            create: input.files.map((f) => ({
              name: f.name,
              quality: f.quality,
              resolution: f.resolution,
              format: f.format,
              language: f.language,
              subtitle: f.subtitle,
              size: f.size,
              link: f.link,
            })),
          }
        : undefined,
    },
  });
}

export async function deleteEpisode(id: string) {
  await prisma.episode.delete({ where: { id } });
}

export async function getEpisodeById(id: string) {
  return prisma.episode.findUnique({
    where: { id },
    include: {
      files: { orderBy: { createdAt: "asc" } },
      season: {
        include: { series: { select: { id: true, title: true, slug: true } } },
      },
    },
  });
}
