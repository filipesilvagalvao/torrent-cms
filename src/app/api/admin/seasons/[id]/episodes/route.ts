import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { createEpisode } from "../../../../../../services/series";
import { episodeSchema } from "../../../../../../lib/validators";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  const episodes = await prisma.episode.findMany({
    where: { seasonId: id },
    orderBy: { number: "asc" },
    include: { _count: { select: { files: true } } },
  });
  return NextResponse.json({ data: episodes });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
  const parsed = episodeSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const episode = await createEpisode(id, parsed.data);
    return NextResponse.json({ data: episode }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Erro ao criar episódio" },
      { status: 500 },
    );
  }
}
