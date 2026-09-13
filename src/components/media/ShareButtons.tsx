import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faWhatsapp,
  faTelegram,
} from "@fortawesome/free-brands-svg-icons";
import { buildShareUrl } from "../../lib/utils";

type Social = "facebook" | "whatsapp" | "telegram";

type Props = {
  url: string;
  text: string;
  socials?: Social[];
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export default function ShareButtons({
  url,
  text,
  socials = ["facebook", "whatsapp", "telegram"],
}: Props) {
  const absolute = url.startsWith("http") ? url : SITE_URL + url;

  return (
    <span style={{ display: "inline-flex", gap: "0.4rem" }}>
      {socials.includes("facebook") ? (
        <a
          href={buildShareUrl("facebook", absolute, text)}
          target="_blank"
          rel="noreferrer"
          style={socialBtn("#1877F2")}
          aria-label="Compartilhar no Facebook"
          title="Compartilhar no Facebook"
        >
          <FontAwesomeIcon icon={faFacebookF} />
        </a>
      ) : null}
      {socials.includes("whatsapp") ? (
        <a
          href={buildShareUrl("whatsapp", absolute, text)}
          target="_blank"
          rel="noreferrer"
          style={socialBtn("#25D366")}
          aria-label="Compartilhar no WhatsApp"
          title="Compartilhar no WhatsApp"
        >
          <FontAwesomeIcon icon={faWhatsapp} />
        </a>
      ) : null}
      {socials.includes("telegram") ? (
        <a
          href={buildShareUrl("telegram", absolute, text)}
          target="_blank"
          rel="noreferrer"
          style={socialBtn("#229ED9")}
          aria-label="Compartilhar no Telegram"
          title="Compartilhar no Telegram"
        >
          <FontAwesomeIcon icon={faTelegram} />
        </a>
      ) : null}
    </span>
  );
}

function socialBtn(bg: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: "50%",
    color: "#ffffff",
    background: bg,
    border: "1px solid rgba(255,255,255,0.15)",
  };
}
