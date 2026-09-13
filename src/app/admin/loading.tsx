import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function AdminLoading() {
  return (
    <div style={{ display: "grid", placeItems: "center", padding: "4rem 0" }}>
      <FontAwesomeIcon
        icon={faSpinner}
        spin
        style={{ fontSize: "2rem", color: "var(--main-color)" }}
      />
    </div>
  );
}
