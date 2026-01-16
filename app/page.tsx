'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Database,
  Zap,
  Shield,
  Rocket,
  Github,
  Copy,
  Check,
  Container,
  Pin,
  Layers,
  Users,
  ExternalLink
} from 'lucide-react';
import { UserProfile } from '@/components/ui/user-profile';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
}

interface DatabaseAdapter {
  name: string;
  icon: string;
  status: 'active' | 'coming-soon';
  description: string;
}

interface TechItem {
  name: string;
  icon: string;
  url: string;
}

export default function HomePage() {
  const [copied, setCopied] = useState(false);
  const [contributors, setContributors] = useState<Contributor[]>([
    {
      login: 'bosenilotpal',
      avatar_url: 'https://github.com/bosenilotpal.png',
      html_url: 'https://github.com/bosenilotpal'
    },
    {
      login: 'sayak-dutta',
      avatar_url: 'https://github.com/sayak-dutta.png',
      html_url: 'https://github.com/sayak-dutta'
    }
  ]);

  useEffect(() => {
    // Attempt to fetch fresh data, but fallback to hardcoded if private/fails
    fetch('https://api.github.com/repos/bosenilotpal/dbscope/contributors')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Repo not public or not found');
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setContributors(data);
        }
      })
      .catch((err) => {
        console.log('Using fallback contributors:', err.message);
      });
  }, []);

  const dockerCommand = 'docker run -d -p 3847:3847 -v dbscope-data:/app/data dbscope/app:latest';

  const handleCopy = () => {
    navigator.clipboard.writeText(dockerCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const databaseAdapters: DatabaseAdapter[] = [
    {
      name: 'Cassandra',
      icon: '/Cassandra_logo.svg',
      status: 'active',
      description: 'Apache Cassandra distributed database'
    },
    {
      name: 'ScyllaDB',
      icon: '/scylladb_logo.svg',
      status: 'active',
      description: 'High-performance Cassandra-compatible database'
    },
    {
      name: 'MongoDB',
      icon: '/mongodb_logo.svg',
      status: 'coming-soon',
      description: 'Document-oriented NoSQL database'
    },
    {
      name: 'CockroachDB',
      icon: '',
      status: 'coming-soon',
      description: 'Distributed SQL database'
    },
    {
      name: 'Redis',
      icon: '/redis_logo.svg',
      status: 'coming-soon',
      description: 'In-memory data structure store'
    }
  ];

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

  const techStack: TechItem[] = [
    {
      name: 'Next.js 16',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
      url: 'https://nextjs.org'
    },
    {
      name: 'React 19',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      url: 'https://react.dev'
    },
    {
      name: 'TypeScript',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
      url: 'https://www.typescriptlang.org'
    },
    {
      name: 'Tailwind CSS',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg',
      url: 'https://tailwindcss.com'
    },
    {
      name: 'GraphQL',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg',
      url: 'https://graphql.org'
    },
    {
      name: 'Monaco Editor',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
      url: 'https://microsoft.github.io/monaco-editor'
    },
    {
      name: 'SQLite',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg',
      url: 'https://sqlite.org'
    },
    {
      name: 'Docker',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
      url: 'https://docker.com'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-black dark:to-black">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm shadow-slate-200/50 dark:shadow-slate-900/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-600/25">
              <Database className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">DBscope</span>
          </div>
          <nav className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Features
            </a>
            <a
              href="#adapters"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              Databases
            </a>
            <a
              href="https://github.com/bosenilotpal/dbscope"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 transition-colors hover:text-slate-900"
            >
              <Github className="h-5 w-5" />
            </a>
            <Link
              href="/connect"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30 hover:scale-[1.02]"
            >
              <Rocket className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
              Get Started
            </Link>
            <ThemeToggle />
            <UserProfile />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-20">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-950 dark:to-violet-950 px-4 py-1.5 text-sm text-blue-700 dark:text-blue-300 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 animate-pulse"></div>
            Open Source • Secure • Production Ready
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white md:text-6xl lg:text-7xl">
            The Modern UI for
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              NoSQL Databases
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400 md:text-xl">
            A unified, beautiful interface to connect, explore, and query your NoSQL databases.
            Built with Next.js, Docker-ready, and designed for developer productivity.
          </p>

          {/* Docker Command Box */}
          <div className="mx-auto mb-12 max-w-3xl">
            <div className="group rounded-2xl bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-blue-500/10 p-[1px] shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10">
              <div className="rounded-2xl bg-slate-900 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Quick Start
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-slate-700 hover:text-white hover:scale-105"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-400" />
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
                <code className="block text-left text-sm leading-relaxed text-emerald-400 font-mono">
                  {dockerCommand}
                </code>
                <p className="mt-3 text-xs text-slate-500">
                  Access at <span className="text-blue-400 font-medium">http://localhost:3847</span>
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/connect"
              className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 font-semibold text-white shadow-xl shadow-blue-600/30 transition-all hover:shadow-2xl hover:shadow-blue-600/40 hover:scale-[1.02]"
            >
              <Rocket className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:rotate-12" />
              Get Started
            </Link>
            <a
              href="https://github.com/bosenilotpal/dbscope"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 px-8 py-4 font-semibold text-slate-700 dark:text-slate-200 shadow-lg shadow-slate-200/50 dark:shadow-black/50 transition-all hover:shadow-xl hover:scale-[1.02] dark:border dark:border-slate-800"
            >
              <Github className="h-5 w-5" />
              Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Database Adapters Section */}
      <section id="adapters" className="py-20 bg-gradient-to-b from-white to-slate-50/50 dark:from-black dark:to-black">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">Supported Database Adapters</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Connect to your favorite NoSQL databases with native drivers and optimized performance
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 max-w-5xl mx-auto">
            {databaseAdapters.map((adapter) => (
              <div
                key={adapter.name}
                className={`group relative rounded-2xl p-6 transition-all duration-300 ${adapter.status === 'active'
                  ? 'bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-black/50 hover:shadow-xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10 hover:-translate-y-1 dark:border dark:border-slate-800'
                  : 'bg-slate-50/50 dark:bg-slate-900/50 opacity-75 hover:opacity-100 dark:border dark:border-slate-800'
                  }`}
              >
                {adapter.status === 'coming-soon' && (
                  <span className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
                    Soon
                  </span>
                )}
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-xl ${adapter.status === 'active'
                    ? 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700'
                    : 'bg-slate-100 dark:bg-slate-800'
                    } transition-transform group-hover:scale-110`}>
                    {adapter.icon ? (
                      <Image
                        src={adapter.icon}
                        alt={adapter.name}
                        width={40}
                        height={40}
                        className={adapter.status === 'coming-soon' ? 'opacity-50 grayscale' : ''}
                      />
                    ) : (
                      <Database className={`h-8 w-8 ${adapter.status === 'coming-soon' ? 'text-slate-400' : 'text-blue-600'}`} />
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{adapter.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{adapter.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-50/50 dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">Everything You Need</h2>
            <p className="text-slate-600 dark:text-slate-400">Built for developers who demand both power and simplicity</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-lg shadow-slate-200/50 dark:shadow-black/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 dark:border dark:border-slate-800"
              >
                <div className="mb-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950 dark:to-violet-950 text-blue-600 dark:text-blue-400 transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/25">
                    <feature.icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Built with Modern Tech</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Reliable, secure, and production-ready stack</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {techStack.map((tech) => (
              <a
                key={tech.name}
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-md shadow-slate-200/50 dark:shadow-black/50 transition-all hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 hover:text-blue-600 dark:border dark:border-slate-800"
              >
                <Image
                  src={tech.icon}
                  alt={tech.name}
                  width={20}
                  height={20}
                  className="h-5 w-5 transition-transform group-hover:scale-110"
                  unoptimized
                />
                {tech.name}
                <ExternalLink className="h-3 w-3 opacity-0 -ml-1 transition-all group-hover:opacity-50 group-hover:ml-0" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contributors Section */}
      <section className="py-16 bg-gradient-to-b from-slate-50/50 to-white dark:from-black dark:to-black">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950 dark:to-violet-950 p-4 shadow-lg shadow-blue-500/10">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">
              Community Contributors
            </h3>
            <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-400">
              Join our growing community of developers building the future of database management.
            </p>
          </div>

          <div className="mb-8 flex flex-wrap justify-center gap-4">
            {contributors.map((contributor) => (
              <a
                key={contributor.login}
                href={contributor.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                title={contributor.login}
              >
                <Image
                  src={contributor.avatar_url}
                  alt={contributor.login}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full shadow-lg shadow-slate-200/50 ring-2 ring-white transition-all group-hover:scale-110 group-hover:ring-blue-400 group-hover:shadow-xl"
                  unoptimized
                />
              </a>
            ))}
          </div>

          <a
            href="https://github.com/bosenilotpal/dbscope"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-lg shadow-slate-200/50 dark:shadow-black/50 transition-all hover:shadow-xl hover:scale-[1.02] dark:border dark:border-slate-800"
          >
            <Github className="h-4 w-4" />
            Become a Contributor
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-black border-t border-slate-100 dark:border-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 flex justify-center gap-6">
            <a
              href="https://github.com/bosenilotpal/dbscope"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-all hover:text-slate-900 dark:hover:text-white hover:scale-110"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            DBscope • Built by developers, for developers
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Open source under MIT License
          </p>
        </div>
      </footer >

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div >
  );
}
