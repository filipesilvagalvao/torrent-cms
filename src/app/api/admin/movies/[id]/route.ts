import { NextResponse } from "next/server";
import {
  deleteMovie,
  getMovieById,
  toggleFeature,
  togglePublish,
  updateMovie,
} from "../../../../../services/movies";
import { movieSchema } from "../../../../../lib/validators";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  const movie = await getMovieById(id);
  if (!movie) {
    return NextResponse.json({ error: "Filme não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ data: movie });
}

export async function PUT(
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
  const parsed = movieSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const movie = await updateMovie(id, parsed.data);
    return NextResponse.json({ data: movie });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Erro ao atualizar filme" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  try {
    await deleteMovie(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Erro ao excluir filme" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  let payload: { action?: string } = {};
  try {
    payload = (await req.json()) as { action?: string };
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
  try {
    if (payload.action === "publish") {
      const m = await togglePublish(id);
      return NextResponse.json({ data: { id: m.id, published: m.published } });
    }
    if (payload.action === "feature") {
      const m = await toggleFeature(id);
      return NextResponse.json({ data: { id: m.id, featured: m.featured } });
    }
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Erro" },
      { status: 500 },
    );
  }
}
