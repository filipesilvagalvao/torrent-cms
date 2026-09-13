import { getAllGenres } from "../../../../services/catalog";
import MovieForm from "../../../../components/admin/MovieForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Novo filme" };

export default async function NewMoviePage() {
  const genres = await getAllGenres();
  return (
    <div>
      <header
        className="page-header"
        style={{ padding: 0, border: "none", marginBottom: "1.5rem" }}
      >
        <h1>Novo filme</h1>
        <p>
          Informe o TMDB ID e clique em “Importar informações” para preencher
          os campos automaticamente. Depois revise e adicione os arquivos de
          download.
        </p>
      </header>
      <MovieForm mode="create" genres={genres} />
    </div>
  );
}
