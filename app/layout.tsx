import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { HydrationProvider } from "@/components/layout/HydrationProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ContratoGen",
  description: "Gerador de contratos de locação",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="antialiased bg-gray-50 font-sans">
        <HydrationProvider>
          <Sidebar />
          <div className="ml-60 flex flex-col min-h-screen">
            <TopBar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </HydrationProvider>
      </body>
    </html>
  );
}
