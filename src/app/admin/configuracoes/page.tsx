import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Configurações",
};

export default async function AdminConfiguracoesPage() {
  const settings = await prisma.settings.findFirst();
  const hasStoredTmdbKey = Boolean(settings?.tmdbApiKey);
  const displayTmdb = hasStoredTmdbKey
    ? `•••• ${settings?.tmdbApiKey?.slice(-4) ?? ""}`
    : null;

  return (
    <div>
      <header
        className="page-header"
        style={{ padding: 0, border: "none", marginBottom: "1.5rem" }}
      >
        <h1>Configurações do site</h1>
        <p>
          Atualize as informações gerais, a chave da API do TMDB e suas redes
          sociais.
        </p>
      </header>

      <SettingsForm
        hasStoredTmdbKey={hasStoredTmdbKey}
        initial={{
          siteName: settings?.siteName ?? "Playcinix",
          siteDescription: settings?.siteDescription ?? null,
          tmdbApiKey: displayTmdb,
          facebookUrl: settings?.facebookUrl ?? null,
          twitterUrl: settings?.twitterUrl ?? null,
          instagramUrl: settings?.instagramUrl ?? null,
          telegramUrl: settings?.telegramUrl ?? null,
          whatsappNumber: settings?.whatsappNumber ?? null,
        }}
      />
    </div>
  );
}
