import { prisma } from "../lib/prisma";
import type { CommentCreateInput } from "../lib/validators";

export type AdminCommentRow = {
  id: string;
  authorName: string;
  content: string;
  approved: boolean;
  createdAt: Date;
  movie: { id: string; title: string; slug: string } | null;
  series: { id: string; title: string; slug: string } | null;
};

export async function listAdminComments(): Promise<AdminCommentRow[]> {
  const items = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      movie: { select: { id: true, title: true, slug: true } },
      series: { select: { id: true, title: true, slug: true } },
    },
    take: 200,
  });
  return items.map((c) => ({
    id: c.id,
    authorName: c.authorName,
    content: c.content,
    approved: c.approved,
    createdAt: c.createdAt,
    movie: c.movie,
    series: c.series,
  }));
}

export async function createComment(input: CommentCreateInput) {
  if (input.type === "movie") {
    const exists = await prisma.movie.findUnique({
      where: { id: input.itemId },
      select: { id: true },
    });
    if (!exists) throw new Error("Filme não encontrado");
    return prisma.comment.create({
      data: {
        authorName: input.authorName.trim(),
        content: input.content.trim(),
        approved: true,
        movieId: input.itemId,
      },
    });
  }
  const exists = await prisma.series.findUnique({
    where: { id: input.itemId },
    select: { id: true },
  });
  if (!exists) throw new Error("Série não encontrada");
  return prisma.comment.create({
    data: {
      authorName: input.authorName.trim(),
      content: input.content.trim(),
      approved: true,
      seriesId: input.itemId,
    },
  });
}

export async function deleteComment(id: string) {
  await prisma.comment.delete({ where: { id } });
}

export async function toggleApproveComment(id: string) {
  const c = await prisma.comment.findUnique({ where: { id } });
  if (!c) throw new Error("Comentário não encontrado");
  return prisma.comment.update({
    where: { id },
    data: { approved: !c.approved },
  });
}

export async function getCommentsFor(itemType: "movie" | "series", itemId: string) {
  return prisma.comment.findMany({
    where: {
      approved: true,
      ...(itemType === "movie" ? { movieId: itemId } : { seriesId: itemId }),
    },
    orderBy: { createdAt: "desc" },
  });
}
