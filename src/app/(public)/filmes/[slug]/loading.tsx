import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function Loading() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <FontAwesomeIcon
        icon={faSpinner}
        spin
        style={{ fontSize: "2.4rem", color: "var(--main-color)" }}
      />
    </div>
  );
}
