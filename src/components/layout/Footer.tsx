import Link from "next/link";

type Settings = {
  siteName: string;
  siteDescription: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  telegramUrl: string | null;
  whatsappNumber: string | null;
};

type Props = {
  settings: Settings;
};

export default function Footer({ settings }: Props) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__col">
            <h4>{settings.siteName}</h4>
            <p>
              {settings.siteDescription ??
                "Catálogo moderno de filmes e séries com identidade visual própria."}
            </p>
          </div>
          <div className="site-footer__col">
            <h4>Navegar</h4>
            <ul>
              <li>
                <Link href="/filmes">Filmes</Link>
              </li>
              <li>
                <Link href="/series">Séries</Link>
              </li>
              <li>
                <Link href="/categorias">Categorias</Link>
              </li>
              <li>
                <Link href="/como-baixar">Como baixar?</Link>
              </li>
            </ul>
          </div>
          <div className="site-footer__col">
            <h4>Siga-nos</h4>
            <ul>
              {settings.facebookUrl ? (
                <li>
                  <a href={settings.facebookUrl} target="_blank" rel="noreferrer">
                    Facebook
                  </a>
                </li>
              ) : null}
              {settings.instagramUrl ? (
                <li>
                  <a href={settings.instagramUrl} target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                </li>
              ) : null}
              {settings.telegramUrl ? (
                <li>
                  <a href={settings.telegramUrl} target="_blank" rel="noreferrer">
                    Telegram
                  </a>
                </li>
              ) : null}
              {settings.whatsappNumber ? (
                <li>
                  <a
                    href={`https://wa.me/${settings.whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp
                  </a>
                </li>
              ) : null}
              {!settings.facebookUrl &&
              !settings.instagramUrl &&
              !settings.telegramUrl &&
              !settings.whatsappNumber ? (
                <li>Em breve</li>
              ) : null}
            </ul>
          </div>
        </div>
        <div className="site-footer__bottom">
          © {new Date().getFullYear()} {settings.siteName}. Conteúdo próprio,
          licenciado ou de domínio público.
        </div>
      </div>
    </footer>
  );
}
