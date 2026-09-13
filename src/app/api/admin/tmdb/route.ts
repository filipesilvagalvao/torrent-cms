import { NextResponse } from "next/server";
import { importFromTmdb, isTmdbConfigured } from "../../../../services/tmdb";
import { tmdbImportSchema } from "../../../../lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  const ok = await isTmdbConfigured();
  return NextResponse.json({ configured: ok });
}

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const parsed = tmdbImportSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const data = await importFromTmdb(parsed.data.type, parsed.data.tmdbId);
    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Erro ao consultar TMDB" },
      { status: 502 },
    );
  }
}
