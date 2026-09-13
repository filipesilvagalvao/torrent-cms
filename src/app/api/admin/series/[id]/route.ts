import { NextResponse } from "next/server";
import {
  deleteSeries,
  getSeriesById,
  toggleFeatureSeries,
  togglePublishSeries,
  updateSeries,
} from "../../../../../services/series";
import { seriesSchema } from "../../../../../lib/validators";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  const series = await getSeriesById(id);
  if (!series) {
    return NextResponse.json({ error: "Série não encontrada" }, { status: 404 });
  }
  return NextResponse.json({ data: series });
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
  const parsed = seriesSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const series = await updateSeries(id, parsed.data);
    return NextResponse.json({ data: series });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Erro ao atualizar série" },
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
    await deleteSeries(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Erro ao excluir série" },
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
      const s = await togglePublishSeries(id);
      return NextResponse.json({ data: { id: s.id, published: s.published } });
    }
    if (payload.action === "feature") {
      const s = await toggleFeatureSeries(id);
      return NextResponse.json({ data: { id: s.id, featured: s.featured } });
    }
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Erro" },
      { status: 500 },
    );
  }
}
