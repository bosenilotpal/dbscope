'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function TermsPage() {
    return (
        <div className="min-h-screen">
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
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Terms of Service</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">Last updated: January 17, 2026</p>

                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                By accessing or using DBscope, you agree to be bound by these Terms of Service.
                                If you do not agree to these terms, please do not use our service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">2. Description of Service</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                DBscope is an open-source database viewer application that allows users to connect to,
                                explore, and query NoSQL databases including Cassandra, ScyllaDB, MongoDB, and more.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">3. User Responsibilities</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                As a user of DBscope, you agree to:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                                <li>Provide accurate account information</li>
                                <li>Maintain the security of your account credentials</li>
                                <li>Use the service only for lawful purposes</li>
                                <li>Not attempt to gain unauthorized access to any databases</li>
                                <li>Comply with all applicable laws and regulations</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">4. Database Connections</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                You are solely responsible for:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                                <li>Ensuring you have proper authorization to access connected databases</li>
                                <li>The security of your database credentials</li>
                                <li>Any actions performed on databases through our service</li>
                                <li>Compliance with your database provider&apos;s terms of service</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">5. Open Source License</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                DBscope is released under the MIT License. You are free to use, modify, and distribute
                                the software in accordance with the terms of that license. The source code is available
                                on <a href="https://github.com/bosenilotpal/dbscope" className="text-blue-600 hover:underline">GitHub</a>.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">6. Disclaimer of Warranties</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                DBscope is provided &quot;as is&quot; without warranty of any kind, express or implied.
                                We do not guarantee that the service will be uninterrupted, secure, or error-free.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">7. Limitation of Liability</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                In no event shall DBscope or its contributors be liable for any indirect, incidental,
                                special, consequential, or punitive damages, including but not limited to loss of data,
                                profits, or business opportunities.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">8. Modifications to Terms</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                We reserve the right to modify these terms at any time. Changes will be posted on this page
                                with an updated revision date. Continued use of the service after changes constitutes
                                acceptance of the modified terms.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">9. Termination</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                We may terminate or suspend your access to the service at any time, without prior notice,
                                for conduct that we believe violates these terms or is harmful to other users or the service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">10. Contact</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                For questions about these Terms of Service, please contact us through our
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
