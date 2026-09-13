import Link from "next/link";
import { getAllGenres } from "../../../services/catalog";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Categorias",
  description: "Explore o catálogo por gênero no Playcinix.",
};

export default async function CategoriesPage() {
  const genres = await getAllGenres();
  return (
    <section className="section">
      <div className="container">
        <header className="page-header" style={{ padding: 0, border: "none", margin: 0 }}>
          <h1>Categorias</h1>
          <p>Escolha um gênero para explorar o catálogo disponível.</p>
        </header>
        <div className="media-grid">
          {genres.map((g) => (
            <Link
              key={g.id}
              href={`/categorias/${g.slug}`}
              className="pill"
              style={{ justifyContent: "center", height: 64, fontSize: "1rem" }}
            >
              {g.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
