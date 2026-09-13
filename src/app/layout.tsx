import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteMetadata } from "../lib/seo";

export const metadata: Metadata = siteMetadata;

export const viewport: Viewport = {
  themeColor: "#020916",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
