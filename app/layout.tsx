import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Farolfix | Polimento de farol em domicílio",
  description:
    "Seu farol como novo, sem sair de casa. Atendimento premium com agendamento rápido e painel admin móvel.",
  keywords: ["polimento de farol", "restauração de farol", "farolfix"],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/logo-farolfix.png",
    apple: "/logo-farolfix.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#0A84FF"
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
