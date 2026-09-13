import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  // Limpa os conteúdos mantendo genres e user (idempotente)
  await prisma.file.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.season.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.series.deleteMany();
  await prisma.settings.deleteMany();

  // Admin padrão (idempotente)
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@playcinix.local" },
    update: { passwordHash, name: "Administrador", role: "ADMIN" },
    create: {
      name: "Administrador",
      email: "admin@playcinix.local",
      passwordHash,
      role: "ADMIN",
    },
  });

  // Configuração inicial
  await prisma.settings.create({
    data: {
      siteName: "Playcinix",
      siteDescription:
        "Catálogo moderno de filmes e séries com identidade visual própria.",
      facebookUrl: "",
      twitterUrl: "",
      instagramUrl: "",
      telegramUrl: "",
      whatsappNumber: "",
    },
  });

  // Gêneros
  const genresData = [
    "Ação",
    "Aventura",
    "Animação",
    "Comédia",
    "Crime",
    "Documentário",
    "Drama",
    "Família",
    "Fantasia",
    "Ficção Científica",
    "Guerra",
    "Mistério",
    "Música",
    "Romance",
    "Terror",
    "Thriller",
  ];

  const genres = await Promise.all(
    genresData.map((name) =>
      prisma.genre.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: { name, slug: slugify(name) },
      }),
    ),
  );

  const getGenre = (name: string) => {
    const g = genres.find((x) => x.name === name);
    if (!g) throw new Error(`Gênero não encontrado: ${name}`);
    return { id: g.id };
  };

  // Filmes de exemplo (conteúdo próprio/domínio público)
  const moviesData = [
    {
      title: "Aurora Boreal",
      originalTitle: "Aurora Boreal",
      year: 2022,
      overview:
        "Uma jornada visual por paisagens impressionantes do hemisfério norte, explorando a ciência e a poesia por trás das luzes do ártico.",
      rating: 8.1,
      classification: "Livre",
      runtime: 92,
      featured: true,
      languages: "Português, Inglês",
      genres: ["Documentário", "Família"],
    },
    {
      title: "Caminhos da Floresta",
      originalTitle: "Forest Paths",
      year: 2021,
      overview:
        "Um documentário investigativo sobre a relação entre comunidades tradicionais e a preservação das florestas tropicais.",
      rating: 7.6,
      classification: "10 anos",
      runtime: 78,
      featured: true,
      languages: "Português",
      genres: ["Documentário", "Drama"],
    },
    {
      title: "O Último Carteiro",
      originalTitle: "The Last Postman",
      year: 2020,
      overview:
        "Em uma pequena cidade litorânea, um carteiro se prepara para sua última rota enquanto a vila muda para sempre.",
      rating: 7.9,
      classification: "12 anos",
      runtime: 104,
      featured: true,
      languages: "Português, Espanhol",
      genres: ["Drama", "Família"],
    },
    {
      title: "Estações",
      originalTitle: "Estações",
      year: 2023,
      overview:
        "Quatro histórias curtas, quatro estações do ano, um retrato delicado da vida cotidiana.",
      rating: 8.4,
      classification: "Livre",
      runtime: 65,
      featured: false,
      languages: "Português",
      genres: ["Drama", "Romance"],
    },
    {
      title: "Pulso",
      originalTitle: "Pulse",
      year: 2024,
      overview:
        "Um thriller psicológico sobre uma cardiologista que descobre um padrão suspeito nos exames de seus pacientes.",
      rating: 8.0,
      classification: "14 anos",
      runtime: 118,
      featured: true,
      languages: "Português, Inglês",
      genres: ["Thriller", "Mistério", "Drama"],
    },
    {
      title: "Neblina",
      originalTitle: "Neblina",
      year: 2019,
      overview:
        "Em uma noite sem lua, um grupo de amigos se perde em uma estrada rural envolta em neblina densa — e algo observa cada passo.",
      rating: 6.8,
      classification: "16 anos",
      runtime: 96,
      featured: false,
      languages: "Português",
      genres: ["Terror", "Mistério"],
    },
    {
      title: "Corrente",
      originalTitle: "Corrente",
      year: 2018,
      overview:
        "Retrato intimista de uma família de pescadores que atravessa três gerações de mudanças no litoral brasileiro.",
      rating: 7.4,
      classification: "12 anos",
      runtime: 110,
      featured: false,
      languages: "Português",
      genres: ["Drama", "Família"],
    },
    {
      title: "Arquitetos do Som",
      originalTitle: "Sound Architects",
      year: 2024,
      overview:
        "Documentário sobre os bastidores de estúdios lendários de gravação e os engenheiros de áudio que moldaram décadas de história.",
      rating: 8.2,
      classification: "Livre",
      runtime: 88,
      featured: true,
      languages: "Português, Inglês",
      genres: ["Documentário", "Música"],
    },
  ];

  for (const m of moviesData) {
    const slug = slugify(m.title);
    await prisma.movie.create({
      data: {
        title: m.title,
        originalTitle: m.originalTitle,
        slug,
        overview: m.overview,
        year: m.year,
        rating: m.rating,
        classification: m.classification,
        runtime: m.runtime,
        featured: m.featured,
        published: true,
        order: 0,
        languages: m.languages,
        poster: `https://placehold.co/400x600/05132e/79c142?text=${encodeURIComponent(m.title)}`,
        backdrop: `https://placehold.co/1920x1080/020916/79c142?text=${encodeURIComponent(m.title)}`,
        genres: {
          connect: m.genres.map(getGenre),
        },
        files: {
          create: [
            {
              name: `${m.title} - 1080p`,
              quality: "Full HD",
              resolution: "1080p",
              format: "MP4",
              language: "Português",
              subtitle: "Português, Inglês",
              size: "2.4 GB",
              link: "https://example.com/download/" + slug + "-1080p",
            },
            {
              name: `${m.title} - 720p`,
              quality: "HD",
              resolution: "720p",
              format: "MP4",
              language: "Português",
              subtitle: "Português",
              size: "1.2 GB",
              link: "https://example.com/download/" + slug + "-720p",
            },
          ],
        },
        comments: {
          create: [
            {
              authorName: "Visitante",
              content: "Conteúdo muito interessante, obrigado por compartilhar!",
              approved: true,
            },
            {
              authorName: "Carla Mendes",
              content:
                "Acabei de assistir e gostei muito. A direção de fotografia está impecável.",
              approved: true,
            },
          ],
        },
      },
    });
  }

  // Séries de exemplo
  const seriesData = [
    {
      title: "Linha do Horizonte",
      originalTitle: "Horizon Line",
      year: 2023,
      overview:
        "Uma série antológica que explora histórias conectadas de pessoas que vivem às margens do oceano.",
      rating: 8.5,
      classification: "12 anos",
      featured: true,
      languages: "Português",
      seasons: [
        {
          number: 1,
          title: "Margens",
          episodes: [
            { number: 1, title: "A Chegada", overview: "Conhecemos os personagens principais." },
            { number: 2, title: "Maré Alta", overview: "A primeira grande decisão do grupo." },
            { number: 3, title: "Sal", overview: "Segredos vêm à tona." },
          ],
        },
        {
          number: 2,
          title: "Águas Abertas",
          episodes: [
            { number: 1, title: "Novo Rumo", overview: "Uma nova etapa começa." },
            { number: 2, title: "Sexta", overview: "O capítulo final da segunda temporada." },
          ],
        },
      ],
    },
    {
      title: "Códigos",
      originalTitle: "Códigos",
      year: 2022,
      overview:
        "Um thriller seriado sobre uma equipe de programadores que descobre uma conspiração digital.",
      rating: 7.9,
      classification: "14 anos",
      featured: true,
      languages: "Português, Inglês",
      seasons: [
        {
          number: 1,
          title: "Temporada 1",
          episodes: [
            { number: 1, title: "Binário", overview: "O começo de tudo." },
            { number: 2, title: "Loop", overview: "A investigação se intensifica." },
            { number: 3, title: "Pacote", overview: "Um dado importante é interceptado." },
          ],
        },
      ],
    },
  ];

  for (const s of seriesData) {
    const slug = slugify(s.title);
    await prisma.series.create({
      data: {
        title: s.title,
        originalTitle: s.originalTitle,
        slug,
        overview: s.overview,
        year: s.year,
        rating: s.rating,
        classification: s.classification,
        featured: s.featured,
        published: true,
        languages: s.languages,
        poster: `https://placehold.co/400x600/05132e/79c142?text=${encodeURIComponent(s.title)}`,
        backdrop: `https://placehold.co/1920x1080/020916/79c142?text=${encodeURIComponent(s.title)}`,
        seasons: {
          create: s.seasons.map((season) => ({
            number: season.number,
            title: season.title,
            overview: `Temporada ${season.number} de ${s.title}.`,
            episodes: {
              create: season.episodes.map((ep) => ({
                number: ep.number,
                title: ep.title,
                overview: ep.overview,
                runtime: 45,
                files: {
                  create: [
                    {
                      name: `${s.title} S${season.number}E${ep.number} - 1080p`,
                      quality: "Full HD",
                      resolution: "1080p",
                      format: "MP4",
                      language: "Português",
                      subtitle: "Português",
                      size: "1.1 GB",
                      link: `https://example.com/download/${slug}-s${season.number}e${ep.number}-1080p`,
                    },
                  ],
                },
              })),
            },
          })),
        },
        comments: {
          create: [
            {
              authorName: "Bruno",
              content: "A série é viciante, maratonei em dois dias!",
              approved: true,
            },
          ],
        },
      },
    });
  }

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
