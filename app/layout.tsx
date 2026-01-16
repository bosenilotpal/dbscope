import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "DBscope - Multi-Database NoSQL Viewer",
  description: "A unified database viewer for NoSQL databases including Cassandra, MongoDB, DynamoDB, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-black text-slate-900 dark:text-slate-100">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
