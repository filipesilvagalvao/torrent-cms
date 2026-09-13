import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { createSeason } from "../../../../../../services/series";
import { seasonSchema } from "../../../../../../lib/validators";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  const seasons = await prisma.season.findMany({
    where: { seriesId: id },
    orderBy: { number: "asc" },
    include: {
      _count: { select: { episodes: true } },
    },
  });
  return NextResponse.json({ data: seasons });
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
  const parsed = seasonSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const season = await createSeason(id, parsed.data);
    return NextResponse.json({ data: season }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Erro ao criar temporada" },
      { status: 500 },
    );
  }
}
