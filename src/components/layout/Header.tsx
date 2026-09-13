"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

type GenreItem = { id: string; name: string; slug: string };

type Props = {
  genres: GenreItem[];
};

export default function Header({ genres }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    router.push(`/busca?q=${encodeURIComponent(term)}`);
    setIsOpen(false);
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!formRef.current) return;
      if (!formRef.current.contains(e.target as Node)) {
        // nothing for now
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="site-logo" aria-label="Playcinix - página inicial">
          <span className="site-logo__mark" aria-hidden="true">
            <FontAwesomeIcon icon={faBars} />
          </span>
          <span className="site-logo__name">Playcinix</span>
        </Link>

        <form
          ref={formRef}
          className="site-search"
          role="search"
          onSubmit={handleSubmit}
        >
          <FontAwesomeIcon icon={faSearch} className="site-search__icon" />
          <input
            type="search"
            placeholder="Buscar filmes, séries, títulos..."
            aria-label="Buscar no catálogo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <button
          type="button"
          className="site-menu-toggle"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        >
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
        </button>

        <nav className="site-nav" aria-label="Menu principal">
          <div className={`site-nav__links${isOpen ? " is-open" : ""}`}>
            <Link href="/" className="site-nav__link" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link
              href="/filmes"
              className="site-nav__link"
              onClick={() => setIsOpen(false)}
            >
              Filmes
            </Link>
            <Link
              href="/series"
              className="site-nav__link"
              onClick={() => setIsOpen(false)}
            >
              Séries
            </Link>
            <Link
              href="/categorias"
              className="site-nav__link"
              onClick={() => setIsOpen(false)}
            >
              Categorias
            </Link>
            <div className="site-nav__dropdown-wrap">
              <span className="site-nav__link" style={{ color: "var(--light-text)" }}>
                Gêneros
              </span>
              <div className="site-nav__dropdown" role="menu">
                {genres.slice(0, 8).map((g) => (
                  <Link
                    key={g.id}
                    href={`/categorias/${g.slug}`}
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                  >
                    {g.name}
                  </Link>
                ))}
                <Link
                  href="/categorias"
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  style={{ color: "var(--main-color)" }}
                >
                  Ver todas →
                </Link>
              </div>
            </div>
            <Link
              href="/como-baixar"
              className="site-nav__link"
              onClick={() => setIsOpen(false)}
            >
              Como baixar?
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
