import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Multi-Step Agent Retrieval Benchmark (MARB) – Blog",
  description:
    "A one-page writeup of the MARB benchmark for evaluating Exa-powered search in LLM agents.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="site-logo">
            <Image
              src="/exa.jpg"
              alt="Exa logo"
              width={95}
              height={48}
            />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
