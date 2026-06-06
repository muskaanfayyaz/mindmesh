import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MINDMESH | Multi-Agent AI Marketing Orchestration System",
  description: "MindMesh is a real-time multi-agent AI system that personalizes advertising copy, verifies brand compliance, and runs self-improving evolution loops for maximum marketing efficiency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
