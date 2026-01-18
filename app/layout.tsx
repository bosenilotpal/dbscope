import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "DBscope - Multi-Database NoSQL Viewer",
  description: "A unified database viewer for NoSQL databases including Cassandra, MongoDB, DynamoDB, and more.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'DBscope - Multi-Database NoSQL Viewer',
    description: 'A unified, beautiful interface to connect, explore, and query your NoSQL databases. Built with Next.js, Docker-ready.',
    url: 'https://dbscope.vercel.app',
    siteName: 'DBscope',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DBscope - Multi-Database NoSQL Viewer',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DBscope - Multi-Database NoSQL Viewer',
    description: 'A unified, beautiful interface to connect, explore, and query your NoSQL databases.',
    images: ['/og-image.png'],
  },
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
      <body className="antialiased bg-white dark:bg-black text-slate-900 dark:text-slate-100 dot-pattern">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
