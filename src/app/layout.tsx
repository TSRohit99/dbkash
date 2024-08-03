import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "dBKash: Empowering Bangladesh's Digital Future",
  description: "dBKash: Empowering Bangladesh's Digital Future",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <Navbar /> */}
         <main className=""> 
         {children}
        </main>
      </body>
    </html>
  );
}
