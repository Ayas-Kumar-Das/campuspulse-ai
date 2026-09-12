import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/manrope";
import "./globals.css";
import "./upgrade.css";
export const metadata: Metadata = {
  title: "CampusPulse — Your next opportunity",
  description:
    "Your campus, personalized. Discover opportunities, understand eligibility, and stay ahead of deadlines.",
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
