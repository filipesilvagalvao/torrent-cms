import { NextResponse } from "next/server";
import {
  createMovie,
  listMoviesForAdmin,
} from "../../../../services/movies";
import { movieSchema } from "../../../../lib/validators";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? undefined;
  const status = (url.searchParams.get("status") ?? "all") as
    | "all"
    | "published"
    | "draft";
  const genreId = url.searchParams.get("genreId") ?? undefined;
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
  const result = await listMoviesForAdmin({ q, status, genreId, page, pageSize });
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Payload inválido. Envie JSON." },
      { status: 400 },
    );
  }
  const parsed = movieSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const movie = await createMovie(parsed.data);
    return NextResponse.json({ data: movie }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Erro ao criar filme" },
      { status: 500 },
    );
  }
}
