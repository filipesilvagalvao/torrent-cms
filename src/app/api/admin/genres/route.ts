import { NextResponse } from "next/server";
import { createGenre } from "../../../../services/genres";
import { genreSchema } from "../../../../lib/validators";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const genres = await prisma.genre.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { movies: true, series: true } } },
  });
  return NextResponse.json({ data: genres });
}

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
  const parsed = genreSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const genre = await createGenre(parsed.data);
    return NextResponse.json({ data: genre }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Erro ao criar gênero" },
      { status: 500 },
    );
  }
}
