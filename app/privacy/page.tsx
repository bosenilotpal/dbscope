'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black">
            {/* Header */}
            <header className="fixed top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
                <div className="w-full flex h-16 items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                        <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        <Image src="/logo.jpg" alt="DBscope" width={44} height={44} className="h-11 w-11 rounded-xl" />
                        <span className="text-xl font-bold text-slate-900 dark:text-white">DBscope</span>
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            {/* Content */}
            <main className="pt-24 pb-16 px-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Privacy Policy</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">Last updated: January 17, 2026</p>

                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">1. Introduction</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                Welcome to DBscope. We respect your privacy and are committed to protecting your personal data.
                                This privacy policy explains how we collect, use, and safeguard your information when you use our
                                database viewer application.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">2. Information We Collect</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                We collect information that you provide directly to us, including:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                                <li>Account information (username, email address)</li>
                                <li>Authentication data when using OAuth providers (Google, GitHub)</li>
                                <li>Database connection profiles you create (stored locally)</li>
                                <li>Usage data and preferences</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">3. How We Use Your Information</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Authenticate your identity and manage your account</li>
                                <li>Store your database connection preferences securely</li>
                                <li>Communicate with you about updates and security notices</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">4. Data Storage and Security</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                Your data is stored locally using SQLite. We implement industry-standard security measures including:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                                <li>Encrypted password storage using bcrypt</li>
                                <li>JWT-based session management with HTTP-only cookies</li>
                                <li>Secure OAuth 2.0 authentication flows</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">5. Third-Party Services</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                We may use third-party services for authentication (Google OAuth, GitHub OAuth).
                                These services have their own privacy policies governing your data.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">6. Your Rights</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                You have the right to:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                                <li>Access your personal data</li>
                                <li>Correct inaccurate data</li>
                                <li>Delete your account and associated data</li>
                                <li>Export your data</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">7. Contact Us</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                If you have any questions about this Privacy Policy, please contact us through our
                                <a href="https://github.com/bosenilotpal/dbscope" className="text-blue-600 hover:underline ml-1">GitHub repository</a>.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-black">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <div className="flex justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                        <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white">Terms of Service</Link>
                    </div>
                    <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                        © {new Date().getFullYear()} DBscope. Open source under MIT License.
                    </p>
                </div>
            </footer>
        </div>
    );
}
