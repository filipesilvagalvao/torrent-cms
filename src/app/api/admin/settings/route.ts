import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { settingsUpdateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    return NextResponse.json({
      data: {
        siteName: "Playcinix",
        siteDescription: null,
        tmdbApiKey: null,
        facebookUrl: null,
        twitterUrl: null,
        instagramUrl: null,
        telegramUrl: null,
        whatsappNumber: null,
      },
    });
  }
  return NextResponse.json({
    data: {
      ...settings,
      tmdbApiKey: settings.tmdbApiKey
        ? `•••• ${settings.tmdbApiKey.slice(-4)}`
        : null,
    },
  });
}

export async function PUT(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
  const parsed = settingsUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const tmdbApiKey = parsed.data.tmdbApiKey?.trim() || null;
  // Se o usuário não alterou a chave (enviou placeholder mascarado), preserva a anterior
  const existing = await prisma.settings.findFirst();
  let finalTmdbKey: string | null;
  if (tmdbApiKey === null) {
    finalTmdbKey = null;
  } else if (tmdbApiKey.startsWith("•••• ")) {
    finalTmdbKey = existing?.tmdbApiKey ?? null;
  } else {
    finalTmdbKey = tmdbApiKey;
  }

  const data = {
    siteName: parsed.data.siteName,
    siteDescription: parsed.data.siteDescription,
    tmdbApiKey: finalTmdbKey,
    facebookUrl: parsed.data.facebookUrl,
    twitterUrl: parsed.data.twitterUrl,
    instagramUrl: parsed.data.instagramUrl,
    telegramUrl: parsed.data.telegramUrl,
    whatsappNumber: parsed.data.whatsappNumber,
  };

  const settings = existing
    ? await prisma.settings.update({ where: { id: existing.id }, data })
    : await prisma.settings.create({ data });

  return NextResponse.json({
    data: {
      ...settings,
      tmdbApiKey: settings.tmdbApiKey
        ? `•••• ${settings.tmdbApiKey.slice(-4)}`
        : null,
    },
  });
}
