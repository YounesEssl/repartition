import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Répartition des Chambres",
  description: "Glisse les invités dans les chambres",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
