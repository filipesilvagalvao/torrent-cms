import { NextResponse } from "next/server";
import { deleteGenre, updateGenre } from "../../../../../services/genres";
import { genreSchema } from "../../../../../lib/validators";

export const dynamic = "force-dynamic";

type Params = { id: string };

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
  const parsed = genreSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const genre = await updateGenre(id, parsed.data);
    return NextResponse.json({ data: genre });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Erro ao atualizar gênero" },
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
    await deleteGenre(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Erro ao excluir gênero" },
      { status: 500 },
    );
  }
}
