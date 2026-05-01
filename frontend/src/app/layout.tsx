import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";

export const metadata: Metadata = {
  title: "Agriqon | AI Agriculture Marketplace",
  description:
    "AI-powered marketplace for farmers, buyers, semantic product discovery, and RAG assistance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
