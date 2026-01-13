'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Database,
  Zap,
  Shield,
  Code2,
  ArrowRight,
  Github,
  Copy,
  Check,
  Container,
  Pin,
  Clock,
  Layers
} from 'lucide-react';
import { UserProfile } from '@/components/ui/user-profile';

export default function HomePage() {
  const [copied, setCopied] = useState(false);
  const dockerCommand = 'docker run -d -p 3847:3847 -v dbscope-data:/app/data dbscope:latest';

  const handleCopy = () => {
    navigator.clipboard.writeText(dockerCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    {
      icon: Database,
      title: 'Multi-Database',
      description: 'Cassandra, ScyllaDB, MongoDB, DynamoDB'
    },
    {
      icon: Zap,
      title: 'Ultra-Fast',
      description: 'Monaco editor with syntax highlighting'
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'Encrypted profiles, session management'
    },
    {
      icon: Container,
      title: 'Docker Ready',
      description: 'One command deployment'
    },
    {
      icon: Pin,
      title: 'Pinned Sessions',
      description: 'Quick access to favorite connections'
    },
    {
      icon: Layers,
      title: 'Schema Explorer',
      description: 'Interactive tree visualization'
    }
  ];

  const techStack = [
    'Next.js 16',
    'React 19',
    'TypeScript',
    'Tailwind v4',
    'GraphQL',
    'Monaco Editor',
    'better-sqlite3',
    'Docker'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-500">
              <Database className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">DBscope</span>
          </div>
          <nav className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Features
            </a>
            <a
              href="https://github.com/bosenilotpal/dbscope"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              <Github className="inline h-4 w-4" />
            </a>
            <Link
              href="/connect"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md shadow-blue-600/20"
            >
              Get Started
            </Link>
            <UserProfile />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-20">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm text-blue-700">
            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
            Open Source • Secure • Production Ready
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
            The Modern UI for
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 bg-clip-text text-transparent">
              NoSQL Databases
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
            A unified, beautiful interface to connect, explore, and query your NoSQL databases.
            Built with Next.js, Docker-ready, and designed for developer productivity.
          </p>

          {/* Docker Command Box */}
          <div className="mx-auto mb-12 max-w-3xl">
            <div className="group rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-1 shadow-sm transition hover:border-blue-300 hover:shadow-lg">
              <div className="rounded-lg bg-slate-900 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Quick Start
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <code className="block text-left text-sm leading-relaxed text-green-400">
                  {dockerCommand}
                </code>
                <p className="mt-3 text-xs text-slate-500">
                  Access at <span className="text-blue-400">http://localhost:3847</span>
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/connect"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40"
            >
              Connect Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/bosenilotpal/dbscope"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-8 py-3.5 font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <Github className="h-4 w-4" />
              Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="border-t bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-slate-900">Everything You Need</h2>
            <p className="text-slate-600">Built for developers who demand both power and simplicity</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="mb-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:scale-110">
                    <feature.icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h3 className="mb-2 text-2xl font-bold text-slate-900">Built with Modern Tech</h3>
            <p className="text-sm text-slate-600">Reliable, secure, and production-ready stack</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech) => (
              <div
                key={tech}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 flex justify-center gap-6">
            <a
              href="https://github.com/bosenilotpal/dbscope"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 transition hover:text-slate-900"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
          <p className="text-sm text-slate-600">
            DBscope • Built by developers, for developers
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Open source under MIT License
          </p>
        </div>
      </footer>
    </div>
  );
}
