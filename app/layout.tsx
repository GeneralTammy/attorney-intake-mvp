import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaseReady — Attorney Client Intake & Readiness",
  description:
    "Collect structured client intake data and generate case readiness reports for attorneys.",
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
