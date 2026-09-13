import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Como baixar?",
  description: "Aprenda como utilizar os arquivos e links disponibilizados no Playcinix.",
};

const steps = [
  {
    title: "1. Navegue pelo catálogo",
    description:
      "Use o menu principal, o campo de busca ou a página de categorias para encontrar filmes e séries.",
  },
  {
    title: "2. Abra a página do conteúdo",
    description:
      "Clique em um filme ou série para abrir a página individual com todas as informações, sinopse e arquivos disponíveis.",
  },
  {
    title: "3. Escolha o arquivo",
    description:
      "Na seção de arquivos, selecione a qualidade e o formato que você preferir. Cada arquivo possui um botão de download claro.",
  },
  {
    title: "4. Clique em baixar",
    description:
      "O link de download é fornecido pelo administrador do site e contém apenas conteúdo autorizado (próprio, licenciado ou de domínio público).",
  },
  {
    title: "5. Salve na sua lista",
    description:
      "Use o botão + nos cards para adicionar títulos à sua lista de “baixar mais tarde”. A lista é salva no seu navegador.",
  },
];

export default function HowToDownloadPage() {
  return (
    <section className="section">
      <div className="container">
        <header className="page-header" style={{ padding: 0, border: "none", marginBottom: "2rem" }}>
          <h1>Como baixar?</h1>
          <p>
            Os arquivos disponibilizados no Playcinix são conteúdos próprios,
            licenciados ou de domínio público. Abaixo explicamos como encontrá-los
            e utilizá-los.
          </p>
        </header>

        <div className="alert alert--info">
          <strong>Importante:</strong> todos os arquivos disponibilizados no
          site são autorizados. Respeite os direitos autorais e utilize os
          arquivos somente para uso pessoal.
        </div>

        <div className="media-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {steps.map((step) => (
            <article
              key={step.title}
              className="media-card"
              style={{ padding: "1.25rem" }}
            >
              <h3 style={{ color: "var(--main-color)", marginBottom: "0.5rem" }}>
                {step.title}
              </h3>
              <p style={{ color: "var(--light-text)", margin: 0 }}>{step.description}</p>
            </article>
          ))}
        </div>

        <div
          style={{
            marginTop: "2.5rem",
            padding: "1.5rem",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-color-2)",
          }}
        >
          <h2 style={{ marginBottom: "0.75rem" }}>Sobre os arquivos</h2>
          <p>
            Cada conteúdo pode oferecer diferentes opções de qualidade
            (720p, 1080p, 4K), formatos (MP4, MKV), idiomas de áudio e legendas.
            As informações exibidas na página são determinadas pelos dados
            cadastrados pelo administrador no painel do site.
          </p>
          <p>
            Caso tenha dúvidas, utilize o botão de “Salvar para depois”
            (ícone <strong>+</strong>) nos cards para montar a sua lista de
            títulos para baixar mais tarde.
          </p>
        </div>
      </div>
    </section>
  );
}
