'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Lock,
    Palette,
    ArrowLeft,
    Database,
    Save,
    CheckCircle,
    AlertCircle,
    Eye,
    EyeOff,
    Mail
} from 'lucide-react';
import Link from 'next/link';
import { UserProfile } from '@/components/ui/user-profile';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTheme } from '@/context/theme-context';
import Image from 'next/image';

export default function SettingsPage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance'>('profile');
    const [user, setUser] = useState<{
        username: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        isGoogleConnected?: boolean;
        avatarUrl?: string
    } | null>(null);
    const [editableUsername, setEditableUsername] = useState('');
    const [editableFirstName, setEditableFirstName] = useState('');
    const [editableLastName, setEditableLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Security Form State
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetch('/api/auth/session')
            .then((res) => res.json())
            .then((data) => {
                if (data.isAuthenticated) {
                    setUser({
                        username: data.username,
                        email: data.email,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        isGoogleConnected: data.isGoogleConnected,
                        avatarUrl: data.avatarUrl
                    });
                    setEditableUsername(data.username);
                    setEditableFirstName(data.firstName || '');
                    setEditableLastName(data.lastName || '');
                } else {
                    router.push('/login');
                }
            })
            .catch(console.error);
    }, [router]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: editableUsername,
                    firstName: editableFirstName,
                    lastName: editableLastName
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to update profile');

            setUser(prev => prev ? {
                ...prev,
                username: editableUsername,
                firstName: editableFirstName,
                lastName: editableLastName
            } : null);
            setStatus({ type: 'success', message: 'Profile updated successfully' });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
            setStatus({ type: 'error', message: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (securityData.newPassword !== securityData.confirmPassword) {
            setStatus({ type: 'error', message: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: securityData.currentPassword,
                    newPassword: securityData.newPassword
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to update password');

            setStatus({ type: 'success', message: 'Password updated successfully' });
            setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update password';
            setStatus({ type: 'error', message: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'appearance', label: 'Appearance', icon: Palette },
    ];

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
                <div className="w-full flex h-16 items-center justify-between px-6">
                    <Link href="/connect" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                        <ArrowLeft className="h-5 w-5 dark:text-slate-400" />
                        <Image src="/logo.jpg" alt="DBscope" width={44} height={44} className="h-11 w-11 rounded-xl" />
                        <span className="text-xl font-bold text-slate-900 dark:text-white">DBscope</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                        <UserProfile />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your account and app preferences</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
                        {/* Sidebar Navigation */}
                        <aside className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id as 'profile' | 'security' | 'appearance');
                                        setStatus(null);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                        }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </aside>

                        {/* Content Area */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-8">
                                {status && (
                                    <Alert variant={status.type === 'success' ? 'success' : 'destructive'} className="mb-6">
                                        {status.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                        <AlertTitle>{status.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                                        <AlertDescription>{status.message}</AlertDescription>
                                    </Alert>
                                )}

                                {activeTab === 'profile' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">Profile Settings</h2>

                                            <div className="flex items-center gap-6 mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                                <div className="relative">
                                                    {user?.avatarUrl ? (
                                                        <Image src={user.avatarUrl} alt={user.username} width={80} height={80} unoptimized className="h-20 w-20 rounded-full object-cover shadow-lg ring-2 ring-white dark:ring-slate-700" />
                                                    ) : (
                                                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-600/20">
                                                            {user?.username?.[0]?.toUpperCase() || 'U'}
                                                        </div>
                                                    )}
                                                    {user?.isGoogleConnected && (
                                                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1 shadow-sm border border-slate-100 dark:border-slate-800">
                                                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                        Account Identity
                                                        {user?.isGoogleConnected && (
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] lowercase border border-blue-100 dark:border-blue-500/20">
                                                                <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse"></div>
                                                                connected with google
                                                            </span>
                                                        )}
                                                    </p>
                                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                                                        {user?.username || 'LoadingProfile...'}
                                                    </h3>
                                                    {user?.email && (
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                                                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                            {user.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <form onSubmit={handleProfileUpdate} className="grid gap-6 max-w-md">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">First Name</label>
                                                        <input
                                                            type="text"
                                                            value={editableFirstName}
                                                            onChange={(e) => setEditableFirstName(e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-slate-900 dark:text-white font-medium transition-all"
                                                            placeholder="First name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Last Name</label>
                                                        <input
                                                            type="text"
                                                            value={editableLastName}
                                                            onChange={(e) => setEditableLastName(e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-slate-900 dark:text-white font-medium transition-all"
                                                            placeholder="Last name"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
                                                    <div className="relative group">
                                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                        <input
                                                            type="text"
                                                            value={editableUsername}
                                                            onChange={(e) => setEditableUsername(e.target.value)}
                                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-slate-900 dark:text-white font-medium transition-all"
                                                            placeholder="Enter new username"
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 ml-1 leading-relaxed">
                                                        Note: Your username is shown to other members of the workspace and used in activity logs.
                                                    </p>
                                                </div>

                                                {user?.email && (
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                            <input
                                                                type="email"
                                                                value={user.email}
                                                                disabled
                                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-500 font-medium opacity-70 cursor-not-allowed"
                                                            />
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 ml-1 font-medium">
                                                            Email updates are currently locked for verified Google accounts.
                                                        </p>
                                                    </div>
                                                )}

                                                <button
                                                    type="submit"
                                                    disabled={loading || (
                                                        editableUsername === user?.username &&
                                                        editableFirstName === (user?.firstName || '') &&
                                                        editableLastName === (user?.lastName || '')
                                                    )}
                                                    className="w-full h-11 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:shadow-none active:scale-[0.98]"
                                                >
                                                    <Save className="h-4 w-4" />
                                                    {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">Security & Authentication</h2>
                                            <form onSubmit={handlePasswordChange} className="max-w-md space-y-5">
                                                <div className="relative">
                                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Current Password</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showCurrentPass ? "text" : "password"}
                                                            value={securityData.currentPassword}
                                                            onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                                            className="w-full pl-4 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                                            placeholder="Enter current password"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                        >
                                                            {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="relative">
                                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showNewPass ? "text" : "password"}
                                                            value={securityData.newPassword}
                                                            onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                                            className="w-full pl-4 pr-10 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                                            placeholder="Enter new password"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowNewPass(!showNewPass)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                        >
                                                            {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        value={securityData.confirmPassword}
                                                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                                        placeholder="Confirm new password"
                                                        required
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {loading ? (
                                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <Save className="h-4 w-4" />
                                                    )}
                                                    Update Password
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'appearance' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b dark:border-slate-700 pb-4 mb-6">Interface Customization</h2>
                                            <div className="grid gap-6">
                                                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 dark:text-white">Theme Mode</h4>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">Choose between light and dark backgrounds</p>
                                                        </div>
                                                        <div className="flex bg-white dark:bg-slate-700 rounded-lg p-1 border border-slate-100 dark:border-slate-600 shadow-sm">
                                                            <button
                                                                onClick={() => setTheme('light')}
                                                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${theme === 'light' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                                                            >
                                                                Light
                                                            </button>
                                                            <button
                                                                onClick={() => setTheme('dark')}
                                                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${theme === 'dark' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                                                            >
                                                                Dark
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6 border border-slate-100 dark:border-slate-700 rounded-xl">
                                                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Display Density</h4>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Current setting: <span className="font-bold text-blue-600">Compact</span></p>
                                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className="h-full w-full bg-blue-600 rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
