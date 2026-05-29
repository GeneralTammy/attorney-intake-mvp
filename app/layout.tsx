import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaseReady — Attorney Intake & Case Readiness",
  description:
    "Collect structured client intake data and generate case readiness reports for attorneys.",
  icons: {
    icon: "/deepseek_svg_20260529_edd273.svg",
    shortcut: "/deepseek_svg_20260529_edd273.svg",
    apple: "/deepseek_svg_20260529_edd273.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
