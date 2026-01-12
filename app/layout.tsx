import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
