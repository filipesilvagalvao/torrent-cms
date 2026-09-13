import { NextResponse } from "next/server";
import {
  deleteComment,
  toggleApproveComment,
} from "../../../../../services/comments";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  try {
    await deleteComment(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Erro ao excluir" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  try {
    const comment = await toggleApproveComment(id);
    return NextResponse.json({ data: { id: comment.id, approved: comment.approved } });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Erro" },
      { status: 500 },
    );
  }
}
