'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check authentication status
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/session');
                const data = await response.json();
                setIsAuthenticated(data.isAuthenticated || false);
            } catch (error) {
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setIsAuthenticated(false);
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
            setLoading(false);
        }
    };

    // Don't render the button if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Logout"
        >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
        </button>
    );
}
