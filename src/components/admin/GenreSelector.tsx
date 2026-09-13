type Genre = { id: string; name: string };

type Props = {
  genres: Genre[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export default function GenreSelector({ genres, selectedIds, onChange }: Props) {
  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  }
  if (genres.length === 0) {
    return (
      <p style={{ color: "var(--light-text)", fontSize: "0.85rem", margin: 0 }}>
        Nenhum gênero cadastrado ainda. Cadastre em /admin/categorias.
      </p>
    );
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {genres.map((g) => {
        const active = selectedIds.includes(g.id);
        return (
          <button
            key={g.id}
            type="button"
            onClick={() => toggle(g.id)}
            className={`pill${active ? "" : ""}`}
            style={{
              cursor: "pointer",
              opacity: active ? 1 : 0.6,
              background: active
                ? "rgba(121, 193, 66, 0.25)"
                : "rgba(255, 255, 255, 0.06)",
              borderColor: active
                ? "var(--main-color)"
                : "var(--border-color)",
              color: active ? "var(--main-color)" : "var(--text-color-2)",
            }}
          >
            {g.name}
          </button>
        );
      })}
    </div>
  );
}
