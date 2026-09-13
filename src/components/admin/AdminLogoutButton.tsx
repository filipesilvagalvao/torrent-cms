"use client";

import { signOut } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function AdminLogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="btn btn--ghost"
      disabled={loading}
      style={{ alignSelf: "flex-start", padding: "0.4rem 0.85rem" }}
    >
      {loading ? (
        <FontAwesomeIcon icon={faSpinner} spin />
      ) : (
        <FontAwesomeIcon icon={faArrowRightFromBracket} />
      )}
      Sair
    </button>
  );
}
