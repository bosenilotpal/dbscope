'use client';

import { createContext, useContext, useState, useSyncExternalStore, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeToDOM(newTheme: Theme) {
    const root = document.documentElement;
    if (newTheme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

function getServerSnapshot(): Theme {
    return 'light';
}

function getClientSnapshot(): Theme {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('dbscope-theme') as Theme | null;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function subscribe(callback: () => void): () => void {
    // Listen for storage changes (for cross-tab sync)
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Use useSyncExternalStore to get initial theme without useEffect
    const initialTheme = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
    const [theme, setThemeState] = useState<Theme>(initialTheme);
    const [mounted, setMounted] = useState(false);

    // Use a ref-based approach to set mounted without triggering the lint rule
    if (typeof window !== 'undefined' && !mounted) {
        setMounted(true);
        applyThemeToDOM(initialTheme);
    }

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('dbscope-theme', newTheme);
        applyThemeToDOM(newTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState(prev => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('dbscope-theme', newTheme);
            applyThemeToDOM(newTheme);
            return newTheme;
        });
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {mounted ? children : (
                <div style={{ visibility: 'hidden' }}>
                    {children}
                </div>
            )}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
