import type {
  Movie,
  Series,
  Genre,
  File as DbFile,
  Season,
  Episode,
} from "../generated/prisma";

export interface MovieListItem {
  id: string;
  slug: string;
  title: string;
  year: number | null;
  rating: number | null;
  poster: string | null;
  genres: Genre[];
}

export interface SeriesListItem {
  id: string;
  slug: string;
  title: string;
  year: number | null;
  rating: number | null;
  poster: string | null;
  genres: Genre[];
}

export interface HeroSlideItem {
  id: string;
  slug: string;
  type: "movie" | "series";
  title: string;
  year: number | null;
  rating: number | null;
  overview: string | null;
  backdrop: string | null;
  poster: string | null;
  genres: string[];
  hasDownload: boolean;
}

export type MovieDetail = Movie & {
  genres: Genre[];
  files: DbFile[];
  comments: Array<{
    id: string;
    authorName: string;
    content: string;
    createdAt: Date;
  }>;
};

export type SeriesDetail = Series & {
  genres: Genre[];
  seasons: Array<
    Season & {
      episodes: Array<
        Episode & {
          files: DbFile[];
        }
      >;
    }
  >;
  comments: Array<{
    id: string;
    authorName: string;
    content: string;
    createdAt: Date;
  }>;
};
