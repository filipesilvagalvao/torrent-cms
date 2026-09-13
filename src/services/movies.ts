import { prisma } from "../lib/prisma";
import { slugify } from "../lib/utils";
import type { MovieInput } from "../lib/validators";

const MOVIE_INCLUDE = {
  genres: true,
  files: true,
  comments: true,
} as const;

export type AdminMovieRow = {
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
  filesCount: number;
  commentsCount: number;
};

export type AdminMovieListParams = {
  q?: string;
  status?: "all" | "published" | "draft";
  genreId?: string;
  page?: number;
  pageSize?: number;
};

export async function listMoviesForAdmin(
  params: AdminMovieListParams,
): Promise<{ items: AdminMovieRow[]; total: number; page: number; pageSize: number }> {
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
    prisma.movie.count({ where }),
    prisma.movie.findMany({
      where,
      include: {
        genres: { select: { id: true, name: true, slug: true } },
        _count: { select: { files: true, comments: true } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: items.map((m) => ({
      id: m.id,
      slug: m.slug,
      title: m.title,
      originalTitle: m.originalTitle,
      year: m.year,
      rating: m.rating,
      poster: m.poster,
      backdrop: m.backdrop,
      published: m.published,
      featured: m.featured,
      order: m.order,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      genres: m.genres,
      filesCount: m._count.files,
      commentsCount: m._count.comments,
    })),
    total,
    page,
    pageSize,
  };
}

export async function getMovieById(id: string) {
  return prisma.movie.findUnique({
    where: { id },
    include: MOVIE_INCLUDE,
  });
}

export async function getMovieBySlug(slug: string) {
  return prisma.movie.findUnique({
    where: { slug, published: true },
    include: {
      genres: true,
      files: { orderBy: { createdAt: "asc" } },
      comments: {
        where: { approved: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getRelatedMovies(
  movieId: string,
  genreIds: string[],
  limit = 8,
) {
  return prisma.movie.findMany({
    where: {
      published: true,
      id: { not: movieId },
      ...(genreIds.length > 0 ? { genres: { some: { id: { in: genreIds } } } } : {}),
    },
    include: { genres: true },
    orderBy: { rating: "desc" },
    take: limit,
  });
}

function buildSlug(input: MovieInput): string {
  const base = input.slug?.trim() || slugify(input.title);
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug;
}

async function ensureUniqueSlug(base: string, currentId?: string): Promise<string> {
  let slug = base.length === 0 ? `filme-${Date.now()}` : base;
  let attempt = 0;
  while (true) {
    const existing = await prisma.movie.findFirst({
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

export async function createMovie(input: MovieInput) {
  const slug = await ensureUniqueSlug(buildSlug(input));
  return prisma.movie.create({
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
      runtime: input.runtime,
      languages: input.languages,
      featured: input.featured,
      published: input.published,
      order: input.order,
      genres: input.genreIds.length
        ? { connect: input.genreIds.map((id) => ({ id })) }
        : undefined,
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

export async function updateMovie(id: string, input: MovieInput) {
  const existing = await prisma.movie.findUnique({ where: { id } });
  if (!existing) throw new Error("Filme não encontrado");

  const slug = await ensureUniqueSlug(buildSlug(input), id);

  await prisma.file.deleteMany({ where: { movieId: id } });

  return prisma.movie.update({
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
      runtime: input.runtime,
      languages: input.languages,
      featured: input.featured,
      published: input.published,
      order: input.order,
      genres: {
        set: input.genreIds.map((gid) => ({ id: gid })),
      },
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

export async function deleteMovie(id: string) {
  await prisma.movie.delete({ where: { id } });
}

export async function togglePublish(id: string) {
  const m = await prisma.movie.findUnique({ where: { id } });
  if (!m) throw new Error("Filme não encontrado");
  return prisma.movie.update({
    where: { id },
    data: { published: !m.published },
  });
}

export async function toggleFeature(id: string) {
  const m = await prisma.movie.findUnique({ where: { id } });
  if (!m) throw new Error("Filme não encontrado");
  return prisma.movie.update({
    where: { id },
    data: { featured: !m.featured },
  });
}
