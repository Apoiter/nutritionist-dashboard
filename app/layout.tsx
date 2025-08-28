import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nutritionist Dashboard",
  description: "Manage your patients and their diet plans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  // CORRECTED: Changed React.React-Node to React.ReactNode
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}