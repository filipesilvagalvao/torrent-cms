import { z } from "zod";

const yearSchema = z
  .union([z.number().int().min(1800).max(2200), z.null(), z.undefined()])
  .transform((v) => v ?? null)
  .nullable();

const ratingSchema = z
  .union([z.number().min(0).max(10), z.null(), z.undefined()])
  .transform((v) => v ?? null)
  .nullable();

const intStringOrNull = (max: number) =>
  z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((v) => {
      if (v === null || v === undefined || v === "") return null;
      const n = typeof v === "string" ? parseInt(v, 10) : v;
      if (Number.isNaN(n)) return null;
      return Math.min(n, max);
    })
    .nullable();

const stringOrNull = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => (v && v.toString().trim().length > 0 ? v.toString().trim() : null))
  .nullable();

const booleanFromForm = z
  .union([z.boolean(), z.string()])
  .transform((v) => v === true || v === "true" || v === "on" || v === "1");

const intStringOrNumber = z
  .union([z.number().int(), z.string()])
  .transform((v) => (typeof v === "string" ? parseInt(v, 10) || 0 : v));

export const fileSchema = z.object({
  id: z.string().optional(),
  name: stringOrNull,
  quality: stringOrNull,
  resolution: stringOrNull,
  format: stringOrNull,
  language: stringOrNull,
  subtitle: stringOrNull,
  size: stringOrNull,
  link: z.string().min(1, "Informe o link de download"),
});

export type FileInput = z.infer<typeof fileSchema>;

export const movieSchema = z.object({
  tmdbId: intStringOrNull(9999999),
  title: z.string().min(1, "Informe o título"),
  originalTitle: stringOrNull,
  slug: z
    .string()
    .min(1, "Informe o slug")
    .regex(/^[a-z0-9-]+$/i, "Use apenas letras, números e hífens"),
  overview: stringOrNull,
  year: yearSchema,
  rating: ratingSchema,
  classification: stringOrNull,
  poster: stringOrNull.refine(
    (v) => v === null || /^https?:\/\//.test(v) || v.startsWith("/"),
    "Use uma URL válida para o poster",
  ),
  backdrop: stringOrNull.refine(
    (v) => v === null || /^https?:\/\//.test(v) || v.startsWith("/"),
    "Use uma URL válida para o backdrop",
  ),
  trailer: stringOrNull,
  runtime: intStringOrNull(10000),
  languages: stringOrNull,
  featured: booleanFromForm,
  published: booleanFromForm,
  order: intStringOrNumber,
  genreIds: z.array(z.string()).default([]),
  files: z.array(fileSchema).default([]),
});

export type MovieInput = z.infer<typeof movieSchema>;

export const genreSchema = z.object({
  name: z.string().min(1, "Informe o nome do gênero"),
  slug: z
    .string()
    .min(1, "Informe o slug")
    .regex(/^[a-z0-9-]+$/i, "Use apenas letras, números e hífens"),
});

export type GenreInput = z.infer<typeof genreSchema>;

export const tmdbImportSchema = z.object({
  type: z.enum(["movie", "series"]),
  tmdbId: z.coerce.number().int().positive(),
});

export const seriesSchema = z.object({
  tmdbId: intStringOrNull(9999999),
  title: z.string().min(1, "Informe o título"),
  originalTitle: stringOrNull,
  slug: z
    .string()
    .min(1, "Informe o slug")
    .regex(/^[a-z0-9-]+$/i, "Use apenas letras, números e hífens"),
  overview: stringOrNull,
  year: yearSchema,
  rating: ratingSchema,
  classification: stringOrNull,
  poster: stringOrNull.refine(
    (v) => v === null || /^https?:\/\//.test(v) || v.startsWith("/"),
    "Use uma URL válida para o poster",
  ),
  backdrop: stringOrNull.refine(
    (v) => v === null || /^https?:\/\//.test(v) || v.startsWith("/"),
    "Use uma URL válida para o backdrop",
  ),
  trailer: stringOrNull,
  languages: stringOrNull,
  featured: booleanFromForm,
  published: booleanFromForm,
  order: intStringOrNumber,
  genreIds: z.array(z.string()).default([]),
});

export type SeriesInput = z.infer<typeof seriesSchema>;

const isoDateString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined || v === "") return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  })
  .nullable();

export const seasonSchema = z.object({
  number: intStringOrNumber.refine(
    (v) => Number.isInteger(v) && v >= 0,
    "Informe um número válido",
  ),
  title: stringOrNull,
  overview: stringOrNull,
  poster: stringOrNull.refine(
    (v) => v === null || /^https?:\/\//.test(v) || v.startsWith("/"),
    "Use uma URL válida",
  ),
  releaseDate: isoDateString,
});

export type SeasonInput = z.infer<typeof seasonSchema>;

export const episodeSchema = z.object({
  number: intStringOrNumber.refine(
    (v) => Number.isInteger(v) && v >= 0,
    "Informe um número válido",
  ),
  title: z.string().min(1, "Informe o título do episódio"),
  overview: stringOrNull,
  runtime: intStringOrNull(10000),
  airDate: isoDateString,
  stillImage: stringOrNull.refine(
    (v) => v === null || /^https?:\/\//.test(v) || v.startsWith("/"),
    "Use uma URL válida",
  ),
  files: z.array(fileSchema).default([]),
});

export type EpisodeInput = z.infer<typeof episodeSchema>;

export const commentCreateSchema = z.object({
  type: z.enum(["movie", "series"]),
  itemId: z.string().min(1, "Item inválido"),
  authorName: z
    .string()
    .min(2, "Informe seu nome (mínimo 2 letras)")
    .max(80, "Nome muito longo"),
  content: z
    .string()
    .min(3, "Escreva um comentário")
    .max(2000, "Comentário muito longo"),
});

export type CommentCreateInput = z.infer<typeof commentCreateSchema>;

const optionalUrlOrEmpty = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined) return null;
    const trimmed = v.trim();
    if (trimmed.length === 0) return null;
    if (/^https?:\/\//.test(trimmed) || trimmed.startsWith("/")) return trimmed;
    return trimmed;
  })
  .nullable();

export const settingsUpdateSchema = z.object({
  siteName: z.string().min(1, "Informe o nome do site").max(120),
  siteDescription: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v === null || v === undefined) return null;
      const trimmed = v.trim();
      return trimmed.length > 0 ? trimmed : null;
    })
    .nullable(),
  tmdbApiKey: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v === null || v === undefined) return null;
      const trimmed = v.trim();
      return trimmed.length > 0 ? trimmed : null;
    })
    .nullable(),
  facebookUrl: optionalUrlOrEmpty,
  twitterUrl: optionalUrlOrEmpty,
  instagramUrl: optionalUrlOrEmpty,
  telegramUrl: optionalUrlOrEmpty,
  whatsappNumber: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v === null || v === undefined) return null;
      const trimmed = v.trim().replace(/[^0-9]/g, "");
      return trimmed.length > 0 ? trimmed : null;
    })
    .nullable(),
});

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
