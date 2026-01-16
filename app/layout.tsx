import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "DBscope - Multi-Database NoSQL Viewer",
  description: "A unified database viewer for NoSQL databases including Cassandra, MongoDB, DynamoDB, and more.",
};

// Script to apply theme before React hydrates to prevent flash
const themeScript = `
  (function() {
    const stored = localStorage.getItem('dbscope-theme');
    const theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.add(theme);
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased bg-white dark:bg-black text-slate-900 dark:text-slate-100">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
