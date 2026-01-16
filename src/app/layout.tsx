import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Discord Copilot | Admin Console",
  description: "Admin console for configuring your Discord AI Copilot - Built for Figmenta Internship",
  keywords: ["discord", "bot", "ai", "admin", "copilot"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#18181b',
              border: '1px solid #27272a',
              color: '#fafafa',
            },
          }}
        />
      </body>
    </html>
  );
}
