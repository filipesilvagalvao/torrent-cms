import type { MetadataRoute } from "next";
import { getLatestMovies, getLatestSeries } from "../services/catalog";
import { absoluteUrl } from "../lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [movies, series] = await Promise.all([
    getLatestMovies(500),
    getLatestSeries(500),
  ]);

  const now = new Date();

  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: absoluteUrl("/filmes"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/series"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/categorias"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/como-baixar"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...movies.map((m) => ({
      url: absoluteUrl(`/filmes/${m.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...series.map((s) => ({
      url: absoluteUrl(`/series/${s.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
