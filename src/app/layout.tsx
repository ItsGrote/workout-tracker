import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workout Evolution Tracker",
  description: "Track workout progression before visual changes appear.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

