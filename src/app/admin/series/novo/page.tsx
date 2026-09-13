import { getAllGenres } from "../../../../services/catalog";
import SeriesForm from "../../../../components/admin/SeriesForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nova série" };

export default async function NewSeriesPage() {
  const genres = await getAllGenres();
  return (
    <div>
      <header
        className="page-header"
        style={{ padding: 0, border: "none", marginBottom: "1.5rem" }}
      >
        <h1>Nova série</h1>
        <p>
          Informe o TMDB ID e clique em “Importar informações” para preencher
          os campos. Depois adicione temporadas e episódios.
        </p>
      </header>
      <SeriesForm mode="create" genres={genres} />
    </div>
  );
}
