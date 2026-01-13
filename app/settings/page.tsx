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
    EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { UserProfile } from '@/components/ui/user-profile';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance'>('profile');
    const [user, setUser] = useState<{ username: string } | null>(null);
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
                    setUser({ username: data.username });
                } else {
                    router.push('/login');
                }
            })
            .catch(console.error);
    }, [router]);

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
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
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
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/connect" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                        <ArrowLeft className="h-5 w-5" />
                        <Database className="h-8 w-8 text-blue-600" />
                        <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
                            DBscope
                        </span>
                    </Link>
                    <UserProfile />
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                        <p className="text-slate-600 mt-1">Manage your account and app preferences</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
                        {/* Sidebar Navigation */}
                        <aside className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id as any);
                                        setStatus(null);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
                                        }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </aside>

                        {/* Content Area */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                                            <h2 className="text-xl font-bold text-slate-900 border-b pb-4 mb-6">Profile Settings</h2>
                                            <div className="flex items-center gap-6 mb-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                                                    {user?.username?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Account Holder</p>
                                                    <h3 className="text-2xl font-bold text-slate-900">{user?.username || 'Loading...'}</h3>
                                                    <div className="flex gap-2 mt-2">
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">Administrator</span>
                                                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded uppercase">System Root</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid gap-4 max-w-md">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Username</label>
                                                    <input
                                                        type="text"
                                                        value={user?.username || ''}
                                                        disabled
                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 font-medium opacity-75 cursor-not-allowed"
                                                    />
                                                    <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Username cannot be changed for system security reasons.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 border-b pb-4 mb-6">Security & Authentication</h2>
                                            <form onSubmit={handlePasswordChange} className="max-w-md space-y-5">
                                                <div className="relative">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Current Password</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showCurrentPass ? "text" : "password"}
                                                            value={securityData.currentPassword}
                                                            onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                                            className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
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
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showNewPass ? "text" : "password"}
                                                            value={securityData.newPassword}
                                                            onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                                            className="w-full pl-4 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
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
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        value={securityData.confirmPassword}
                                                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
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
                                            <h2 className="text-xl font-bold text-slate-900 border-b pb-4 mb-6">Interface Customization</h2>
                                            <div className="grid gap-6">
                                                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-bold text-slate-900">Theme Mode</h4>
                                                            <p className="text-sm text-slate-500">Choose between light and dark backgrounds</p>
                                                        </div>
                                                        <div className="flex bg-white rounded-lg p-1 border border-slate-100 shadow-sm">
                                                            <button className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-md shadow-sm">Light</button>
                                                            <button className="px-4 py-1.5 text-slate-600 text-xs font-bold rounded-md hover:bg-slate-50" disabled>Dark (Coming Soon)</button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6 border border-slate-100 rounded-xl">
                                                    <h4 className="font-bold text-slate-900 mb-2">Display Density</h4>
                                                    <p className="text-sm text-slate-600 mb-4">Current setting: <span className="font-bold text-blue-600">Compact</span></p>
                                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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
