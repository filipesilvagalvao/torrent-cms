import { prisma } from "../../lib/prisma";
import { auth } from "../../auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilm,
  faTv,
  faLayerGroup,
  faList,
  faTags,
  faCircleCheck,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

import "../../app/globals.css";

export const dynamic = "force-dynamic";

async function getStats() {
  const [
    totalMovies,
    totalSeries,
    totalSeasons,
    totalEpisodes,
    totalGenres,
    publishedMovies,
    publishedSeries,
    draftMovies,
    draftSeries,
  ] = await Promise.all([
    prisma.movie.count(),
    prisma.series.count(),
    prisma.season.count(),
    prisma.episode.count(),
    prisma.genre.count(),
    prisma.movie.count({ where: { published: true } }),
    prisma.series.count({ where: { published: true } }),
    prisma.movie.count({ where: { published: false } }),
    prisma.series.count({ where: { published: false } }),
  ]);

  return {
    totalMovies,
    totalSeries,
    totalSeasons,
    totalEpisodes,
    totalGenres,
    published: publishedMovies + publishedSeries,
    publishedMovies,
    publishedSeries,
    drafts: draftMovies + draftSeries,
  };
}

type CardProps = {
  label: string;
  value: number | string;
  icon: typeof faFilm;
  hint?: string;
};

function StatCard({ label, value, icon, hint }: CardProps) {
  return (
    <div
      style={{
        background: "var(--bg-color-2)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem",
        display: "flex",
        gap: "1rem",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "var(--radius-md)",
          background: "rgba(121, 193, 66, 0.12)",
          color: "var(--main-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
        }}
      >
        <FontAwesomeIcon icon={icon} />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ color: "var(--light-text)", fontSize: "0.85rem" }}>
          {label}
        </span>
        <strong style={{ fontSize: "1.4rem", color: "var(--text-color-1)" }}>
          {value}
        </strong>
        {hint ? (
          <span style={{ color: "var(--light-text)", fontSize: "0.75rem" }}>
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [stats, session] = await Promise.all([getStats(), auth()]);

  return (
    <div>
      <header className="page-header" style={{ padding: 0, border: "none", marginBottom: "1.5rem" }}>
        <h1>
          Olá, {session?.user?.name ?? session?.user?.email ?? "admin"} 👋
        </h1>
        <p>Visão geral do conteúdo cadastrado no catálogo.</p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        <StatCard
          label="Filmes cadastrados"
          value={stats.totalMovies}
          icon={faFilm}
          hint={`${stats.publishedMovies} publicados`}
        />
        <StatCard
          label="Séries cadastradas"
          value={stats.totalSeries}
          icon={faTv}
          hint={`${stats.publishedSeries} publicadas`}
        />
        <StatCard
          label="Temporadas"
          value={stats.totalSeasons}
          icon={faLayerGroup}
        />
        <StatCard
          label="Episódios"
          value={stats.totalEpisodes}
          icon={faList}
        />
        <StatCard label="Gêneros" value={stats.totalGenres} icon={faTags} />
        <StatCard
          label="Conteúdos publicados"
          value={stats.published}
          icon={faCircleCheck}
        />
        <StatCard
          label="Conteúdos em rascunho"
          value={stats.drafts}
          icon={faClock}
        />
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          background: "var(--bg-color-2)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <h2 style={{ marginBottom: "0.75rem" }}>Próximas etapas</h2>
        <ul style={{ paddingLeft: "1.25rem", listStyle: "disc", color: "var(--light-text)" }}>
          <li>CRUD completo de filmes, séries, temporadas e episódios</li>
          <li>Integração com TMDB para importação por ID</li>
          <li>Cadastro de arquivos de download</li>
          <li>Sistema de comentários com moderação</li>
          <li>Autenticação com NextAuth para proteger o painel</li>
        </ul>
      </div>
    </div>
  );
}
