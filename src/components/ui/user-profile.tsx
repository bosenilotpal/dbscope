'use client';

import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { User, LogOut, ChevronDown, Settings, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';

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
    const [user, setUser] = useState<{ username: string } | null>(null);
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
                    setUser({ username: data.username });
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
            className="w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-[99999] animate-in fade-in zoom-in-95 duration-200"
        >
            <div className="px-4 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Account</p>
            </div>
            <button
                onClick={() => {
                    setIsOpen(false);
                    router.push('/settings');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
            >
                <Settings className="h-4 w-4" />
                Account Settings
            </button>
            <button
                onClick={() => {
                    setIsOpen(false);
                    setIsConfirmOpen(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
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
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 group"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-sm group-hover:shadow transition-shadow">
                    <User className="h-4 w-4" />
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-sm font-bold text-slate-900 leading-none">{user.username}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Administrator</span>
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
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-slate-600 mb-8 max-w-[280px]">
                        Any unsaved progress or active database connections might be interrupted.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => setIsConfirmOpen(false)}
                            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors"
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
