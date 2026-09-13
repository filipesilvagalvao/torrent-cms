import { formatDate } from "../../lib/utils";

type Comment = {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date;
};

type Props = {
  comments: Comment[];
  emptyMessage?: string;
};

export default function CommentList({ comments, emptyMessage }: Props) {
  if (comments.length === 0) {
    return (
      <div className="empty-state">
        <h3>Sem comentários ainda</h3>
        <p>{emptyMessage ?? "Seja o primeiro a comentar."}</p>
      </div>
    );
  }
  return (
    <ul
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        listStyle: "none",
        padding: 0,
        margin: 0,
      }}
    >
      {comments.map((c) => (
        <li
          key={c.id}
          style={{
            background: "var(--bg-color-2)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <strong style={{ color: "var(--text-color-1)" }}>{c.authorName}</strong>
            <span style={{ color: "var(--light-text)", fontSize: "0.8rem" }}>
              {formatDate(c.createdAt)}
            </span>
          </div>
          <p style={{ margin: 0, color: "var(--text-color-2)" }}>{c.content}</p>
        </li>
      ))}
    </ul>
  );
}
