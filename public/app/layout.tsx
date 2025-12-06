import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Multi-Step Agent Retrieval Benchmark (MARB) – Blog",
  description:
    "A one-page writeup of the MARB benchmark for evaluating Exa-powered search in LLM agents.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
