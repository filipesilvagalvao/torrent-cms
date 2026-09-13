import Link from "next/link";
import { listAdminComments } from "../../../services/comments";
import { formatDate } from "../../../lib/utils";
import CommentsAdminActions from "../../../components/admin/CommentsAdminActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Comentários" };

export default async function AdminCommentsPage() {
  const comments = await listAdminComments();

  return (
    <div>
      <header
        className="page-header"
        style={{ padding: 0, border: "none", marginBottom: "1.5rem" }}
      >
        <h1>Comentários</h1>
        <p>{comments.length} comentário(s) cadastrados.</p>
      </header>

      {comments.length === 0 ? (
        <div className="empty-state">
          <h3>Sem comentários</h3>
          <p>Os comentários enviados pelos visitantes aparecerão aqui.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {comments.map((c) => (
            <article
              key={c.id}
              style={{
                background: "var(--bg-color-2)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "1rem 1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <header
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <strong style={{ color: "var(--text-color-1)" }}>
                    {c.authorName}
                  </strong>
                  <span style={{ color: "var(--light-text)", marginLeft: "0.5rem", fontSize: "0.85rem" }}>
                    · {formatDate(c.createdAt)}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  {c.movie ? (
                    <Link
                      href={`/filmes/${c.movie.slug}`}
                      style={{
                        color: "var(--main-color)",
                        fontSize: "0.85rem",
                      }}
                    >
                      🎬 {c.movie.title}
                    </Link>
                  ) : null}
                  {c.series ? (
                    <Link
                      href={`/series/${c.series.slug}`}
                      style={{
                        color: "var(--main-color)",
                        fontSize: "0.85rem",
                      }}
                    >
                      📺 {c.series.title}
                    </Link>
                  ) : null}
                  <span
                    className="pill"
                    style={{
                      background: c.approved
                        ? "rgba(121,193,66,0.2)"
                        : "rgba(255,255,255,0.08)",
                      color: c.approved ? "var(--main-color)" : "var(--light-text)",
                      borderColor: c.approved
                        ? "var(--main-color)"
                        : "var(--border-color)",
                    }}
                  >
                    {c.approved ? "Aprovado" : "Oculto"}
                  </span>
                </div>
              </header>
              <p
                style={{
                  color: "var(--text-color-2)",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                }}
              >
                {c.content}
              </p>
              <CommentsAdminActions id={c.id} initialApproved={c.approved} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
