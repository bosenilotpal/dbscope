'use client';

import { useState } from 'react';
import { DatabaseSelector } from '@/components/features/connection/database-selector';
import { ConnectionForm } from '@/components/features/connection/connection-form';
import { Database, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ConnectPage() {
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <ArrowLeft className="h-5 w-5" />
            <Database className="h-8 w-8 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
              DBscope
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="mb-3 text-4xl font-bold">Connect to Database</h1>
            <p className="text-slate-600">
              Connect to your NoSQL database and start exploring your data
            </p>
          </div>

          {/* Content */}
          {!selectedDatabase ? (
            <div className="rounded-xl border bg-white p-8 shadow-sm">
              <DatabaseSelector onSelect={setSelectedDatabase} />
            </div>
          ) : (
            <div className="rounded-xl border bg-white p-8 shadow-sm">
              <button
                onClick={() => setSelectedDatabase(null)}
                className="mb-6 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to database selection
              </button>

              <ConnectionForm databaseType={selectedDatabase} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
