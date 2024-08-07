import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from '../context/WalletProvider';

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
        <WalletProvider>
          <div className="text-sm">
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 2000,
              }}
            />
          </div>
          <main>{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}
