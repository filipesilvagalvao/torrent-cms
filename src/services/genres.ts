import { prisma } from "../lib/prisma";
import { slugify } from "../lib/utils";
import type { GenreInput } from "../lib/validators";

export async function getGenreById(id: string) {
  return prisma.genre.findUnique({ where: { id } });
}

export async function getGenreBySlug(slug: string) {
  return prisma.genre.findUnique({ where: { slug } });
}

export async function createGenre(input: GenreInput) {
  const slug = (input.slug?.trim() || slugify(input.name))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return prisma.genre.create({
    data: { name: input.name.trim(), slug },
  });
}

export async function updateGenre(id: string, input: GenreInput) {
  const existing = await prisma.genre.findUnique({ where: { id } });
  if (!existing) throw new Error("Gênero não encontrado");
  const slug = (input.slug?.trim() || slugify(input.name))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return prisma.genre.update({
    where: { id },
    data: { name: input.name.trim(), slug },
  });
}

export async function deleteGenre(id: string) {
  await prisma.genre.delete({ where: { id } });
}
