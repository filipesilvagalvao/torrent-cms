"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCheck } from "@fortawesome/free-solid-svg-icons";

type Props = {
  id: string;
  type: "movie" | "series";
  title: string;
};

const STORAGE_KEY = "playcinix.watchlist";

type WatchlistEntry = {
  id: string;
  type: "movie" | "series";
  title: string;
  addedAt: string;
};

function readList(): WatchlistEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is WatchlistEntry =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as WatchlistEntry).id === "string",
    );
  } catch {
    return [];
  }
}

function writeList(list: WatchlistEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function WatchlistButton({ id, type, title }: Props) {
  const [active, setActive] = useState<boolean>(() =>
    readList().some((entry) => entry.id === id),
  );

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const list = readList();
    if (active) {
      writeList(list.filter((entry) => entry.id !== id));
      setActive(false);
    } else {
      writeList([
        ...list,
        { id, type, title, addedAt: new Date().toISOString() },
      ]);
      setActive(true);
    }
  }

  return (
    <button
      type="button"
      className={`add-to-list${active ? " is-active" : ""}`}
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? "Remover da lista de baixar mais tarde" : "Adicionar à lista de baixar mais tarde"}
      title={active ? "Remover da lista" : "Baixar mais tarde"}
    >
      <FontAwesomeIcon icon={active ? faCheck : faPlus} />
    </button>
  );
}
