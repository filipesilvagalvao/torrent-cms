import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Playcinix",
    template: "%s · Playcinix",
  },
  description:
    "Catálogo de filmes e séries com identidade visual própria. Conteúdo próprio, licenciado ou de domínio público.",
  keywords: [
    "filmes",
    "séries",
    "catálogo",
    "playcinix",
    "download",
    "streaming",
  ],
  authors: [{ name: "Playcinix" }],
  creator: "Playcinix",
  publisher: "Playcinix",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Playcinix",
    title: "Playcinix",
    description:
      "Catálogo de filmes e séries com identidade visual própria.",
    locale: "pt_BR",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Playcinix",
    description: "Catálogo de filmes e séries com identidade visual própria.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function contentMetadata(opts: {
  title: string;
  description?: string | null;
  image?: string | null;
  url: string;
  type: "video.movie" | "video.tv_show" | "video.episode" | "website";
  publishedTime?: string;
}): Metadata {
  const url = absoluteUrl(opts.url);
  const imageUrl = opts.image ? absoluteUrl(opts.image) : undefined;
  return {
    title: opts.title,
    description:
      opts.description ??
      `Detalhes sobre ${opts.title} no Playcinix.`,
    alternates: { canonical: opts.url },
    openGraph: {
      type: opts.type,
      url,
      title: opts.title,
      description:
        opts.description ?? `Detalhes sobre ${opts.title} no Playcinix.`,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      siteName: "Playcinix",
      locale: "pt_BR",
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description:
        opts.description ?? `Detalhes sobre ${opts.title} no Playcinix.`,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}
