'use client';

import Link from 'next/link';
import { Database, Zap, Shield, Code2, ArrowRight, Github } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Database,
      title: 'Multi-Database Support',
      description: 'Connect to Cassandra, MongoDB, DynamoDB, and more through a unified interface.'
    },
    {
      icon: Zap,
      title: 'Powerful Query Editor',
      description: 'Syntax-highlighted editor with language-specific autocomplete and query history.'
    },
    {
      icon: Shield,
      title: 'Secure Connections',
      description: 'Save connection profiles securely with encrypted credentials and easy switching.'
    },
    {
      icon: Code2,
      title: 'Schema Explorer',
      description: 'Visualize keyspaces, tables, columns, and indexes with an intuitive tree view.'
    }
  ];

  const databases = [
    { name: 'Cassandra', status: 'Available', icon: '🗂️' },
    { name: 'ScyllaDB', status: 'Available', icon: '⚡' },
    { name: 'MongoDB', status: 'Q2 2026', icon: '🍃' },
    { name: 'DynamoDB', status: 'Q2 2026', icon: '📊' },
    { name: 'Redis', status: 'Q3 2026', icon: '🔴' },
    { name: 'Couchbase', status: 'Q3 2026', icon: '🪣' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Database className="h-8 w-8 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
              DBscope
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/connect"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Connect
            </Link>
            <a
              href="/api/graphql"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              API
            </a>
          </ nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-6xl font-black leading-tight tracking-tight">
            The Modern UI for{' '}
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent">
              NoSQL Databases
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-600">
            A unified, beautiful interface to connect, explore, and query your NoSQL databases.
            Built for developers who demand both power and simplicity.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/connect"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/yourusername/dbscope"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:border-slate-400"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold">Built for Developer Productivity</h2>
          <p className="text-slate-600">Everything you need to manage your NoSQL databases</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-xl border bg-white p-6 transition hover:border-blue-300 hover:shadow-lg"
            >
              <div className="mb-4 transition-transform group-hover:scale-110">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Installation Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-bold">Quick Start with Docker</h2>

          <div className="space-y-4">
            <div className="rounded-xl bg-slate-900 p-6">
              <p className="mb-2 text-sm text-slate-400">Pull and run with Docker</p>
              <code className="code-font block text-sm text-green-400">
                docker run -p 3000:3000 dbscope/dbscope:latest
              </code>
            </div>

            <div className="rounded-xl bg-slate-900 p-6">
              <p className="mb-2 text-sm text-slate-400">Or use Docker Compose</p>
              <code className="code-font block text-sm text-green-400">
                docker-compose up -d
              </code>
            </div>
          </div>

          <p className="mt-6 text-center text-slate-600">
            Then navigate to{' '}
            <code className="code-font rounded bg-slate-100 px-2 py-1">localhost:3000</code>
          </p>
        </div>
      </section>

      {/* Supported Databases */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold">Supported Databases</h2>
          <p className="text-slate-600">Connect to your favorite NoSQL databases</p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {databases.map((db) => (
            <div key={db.name} className="text-center">
              <div className="mb-2 text-5xl">{db.icon}</div>
              <div className="font-semibold">{db.name}</div>
              <div
                className={`text-xs ${
                  db.status === 'Available' ? 'text-green-600' : 'text-slate-500'
                }`}
              >
                {db.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-600">
          <p>DBscope - Built by developers, for developers</p>
          <p className="mt-2">Open source under MIT License</p>
        </div>
      </footer>
    </div>
  );
}
