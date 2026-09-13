import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

type Props = {
  value: number | null | undefined;
  showTmdbLabel?: boolean;
  size?: "sm" | "md" | "lg";
};

function format(value: number): string {
  return value.toFixed(1);
}

export default function Rating({ value, showTmdbLabel = true, size = "sm" }: Props) {
  if (value == null) return null;
  const fontSize = size === "lg" ? "1rem" : size === "md" ? "0.9rem" : "0.8rem";
  return (
    <span
      className="rating"
      style={{
        gap: size === "lg" ? "0.4rem" : "0.3rem",
        fontSize,
      }}
    >
      <FontAwesomeIcon icon={faStar} className="rating__icon" />
      <span>{format(value)}</span>
      {showTmdbLabel && <span className="rating__label">TMDB</span>}
    </span>
  );
}
