import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteMetadata: Metadata = {
  title: "Playcinix | Baixar torrent de filmes e séries grátis",
  description:
    "Baixar torrent de filmes e séries grátis, o melhor site de torrents para lançamentos, filmes 1080p, filmes 720p, 4k, séries 1080p, séries 720p.",
  applicationName: "Playcinix",
  authors: [{ name: "Playcinix", url: baseUrl }],
  keywords: [
    "torrent",
    "filmes torrent",
    "séries torrent",
    "baixar torrent",
    "torrent grátis",
    "torrent de filmes",
    "torrent de séries",
    "filmes 1080p torrent",
    "filmes 720p torrent",
    "filmes 4k torrent",
    "séries 1080p torrent",
    "séries 720p torrent",
  ],
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "Playcinix | Baixar torrent de filmes e séries grátis",
    description:
      "Baixar torrent de filmes e séries grátis, o melhor site de torrents para lançamentos, filmes 1080p, filmes 720p, 4k, séries 1080p, séries 720p.",
    url: baseUrl,
    siteName: "Playcinix",
    images: [
      {
        url: "/logos/playcinix-logo.jpg",
        width: 512,
        height: 512,
        alt: "Playcinix — imagem de compartilhamento",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Playcinix | Baixar torrent de filmes e séries grátis",
    description:
      "Baixar torrent de filmes e séries grátis, o melhor site de torrents para lançamentos, filmes 1080p, filmes 720p, 4k, séries 1080p, séries 720p.",
    creator: "@playcinix",
    images: ["/logos/playcinix-logo.jpg"],
  },
  icons: {
    icon: "/logos/favicon.ico",
    shortcut: "/logos/favicon-16x16.png",
    apple: "/logos/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export function absoluteUrl(path: string): string {
  if (!path) return baseUrl;
  if (path.startsWith("http")) return path;
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
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
