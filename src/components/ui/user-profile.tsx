'use client';

import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { User, LogOut, ChevronDown, Settings, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import Image from 'next/image';

function subscribe() {
    return () => { };
}

function getServerSnapshot() {
    return false;
}

function getClientSnapshot() {
    return typeof window !== 'undefined';
}

export function UserProfile() {
    const [isOpen, setIsOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [user, setUser] = useState<{
        username: string;
        email?: string;
        avatarUrl?: string;
        firstName?: string;
        lastName?: string;
        isGoogleConnected?: boolean;
    } | null>(null);
    const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/auth/session')
            .then((res) => res.json())
            .then((data) => {
                if (data.isAuthenticated) {
                    setUser({
                        username: data.username,
                        email: data.email,
                        avatarUrl: data.avatarUrl,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        isGoogleConnected: data.isGoogleConnected
                    });
                }
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update dropdown position when opening
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right
            });
        }
    }, [isOpen]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!user) return null;

    const dropdownContent = (
        <div
            ref={dropdownRef}
            style={{
                position: 'fixed',
                top: dropdownPosition.top,
                right: dropdownPosition.right,
            }}
            className="w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-[99999] animate-in fade-in zoom-in-95 duration-200"
        >
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username}
                    </p>
                    {user.isGoogleConnected && (
                        <div title="Connected with Google" className="flex-shrink-0">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1 flex items-center gap-2 font-bold uppercase tracking-tight">
                    @{user.username}
                    {user.isGoogleConnected && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-600 text-white text-[9px] font-black shadow-sm ring-1 ring-blue-700/50 animate-in fade-in slide-in-from-left-1 duration-500">
                            GOOGLE SSO
                        </span>
                    )}
                </p>
                {user.email && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-1 italic font-medium">{user.email}</p>}
            </div>
            <button
                onClick={() => {
                    setIsOpen(false);
                    router.push('/settings');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
                <Settings className="h-4 w-4" />
                Account Settings
            </button>
            <button
                onClick={() => {
                    setIsOpen(false);
                    setIsConfirmOpen(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors font-medium"
            >
                <LogOut className="h-4 w-4" />
                Logout
            </button>
        </div>
    );

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
            >
                <div className="relative">
                    {user?.avatarUrl ? (
                        <Image src={user.avatarUrl} alt={user.username} width={32} height={32} unoptimized className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-sm group-hover:shadow transition-shadow">
                            <User className="h-4 w-4" />
                        </div>
                    )}
                    {user?.isGoogleConnected && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-sm border border-slate-100 dark:border-slate-800">
                            <svg className="h-2.5 w-2.5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                            {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.username || 'User'}
                        </span>
                        {user?.isGoogleConnected && (
                            <span className="flex items-center px-1.5 py-0.5 rounded-sm bg-blue-600 text-white text-[7px] font-black tracking-tighter uppercase leading-none shadow-sm">
                                GOOGLE
                            </span>
                        )}
                    </div>
                    {user?.email ? (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[100px]">{user.email}</span>
                    ) : (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Administrator</span>
                    )}
                </div>
                <ChevronDown className={cn("h-3 w-3 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            {isOpen && mounted && createPortal(dropdownContent, document.body)}

            <Modal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Confirm Logout"
                description="Are you sure you want to end your current session?"
                maxWidth="sm"
            >
                <div className="flex flex-col items-center text-center py-2">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-950/50 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-[280px]">
                        Any unsaved progress or active database connections might be interrupted.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => setIsConfirmOpen(false)}
                            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-shadow shadow-lg shadow-red-600/20"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
