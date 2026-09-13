import { getAllGenres, getSiteSettings } from "../../services/catalog";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [genres, settings] = await Promise.all([
    getAllGenres(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Header genres={genres.map((g) => ({ id: g.id, name: g.name, slug: g.slug }))} />
      <main className="app-main">{children}</main>
      <Footer
        settings={{
          siteName: settings.siteName,
          siteDescription: settings.siteDescription,
          facebookUrl: settings.facebookUrl,
          twitterUrl: settings.twitterUrl,
          instagramUrl: settings.instagramUrl,
          telegramUrl: settings.telegramUrl,
          whatsappNumber: settings.whatsappNumber,
        }}
      />
    </>
  );
}
