import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aart-Jan Beumer — Senior Software Engineer",
  description:
    "Senior Software Engineer building CMS platforms, integrations, and internal tools. The Randstad, Netherlands.",
  openGraph: {
    title: "Aart-Jan Beumer",
    description: "Senior Software Engineer — CMS platforms, integrations, internal tools.",
    url: "https://ajbeumer.com",
    siteName: "ajbeumer.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
