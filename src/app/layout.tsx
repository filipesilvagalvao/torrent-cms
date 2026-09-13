import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteMetadata } from "../lib/seo";
import Script from "next/script";

export const metadata: Metadata = siteMetadata;

export const viewport: Viewport = {
  themeColor: "#020916",
  width: "device-width",
  initialScale: 1,
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-78D6C1Y7ZD"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-78D6C1Y7ZD');
          `}
        </Script>
      </head>
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
