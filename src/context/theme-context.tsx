'use client';

import { createContext, useContext, useCallback, useSyncExternalStore, useRef, useLayoutEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'dbscope-theme';

// External store for theme
let currentTheme: Theme = 'light';
let isMounted = false;
const listeners = new Set<() => void>();

function getThemeSnapshot(): Theme {
    return currentTheme;
}

function getServerSnapshot(): Theme {
    return 'light';
}

function subscribeToTheme(callback: () => void): () => void {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

function updateTheme(newTheme: Theme) {
    currentTheme = newTheme;
    listeners.forEach(listener => listener());
}

function applyThemeToDOM(theme: Theme) {
    if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Track if this instance has initialized
    const hasInitialized = useRef<boolean | null>(null);

    // Initialize on first render using the recommended pattern
    if (hasInitialized.current === null) {
        hasInitialized.current = false;
    }

    // Use useSyncExternalStore to avoid setState in effect lint error
    const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerSnapshot);

    // Initialize theme synchronously on layout effect (before paint)
    useLayoutEffect(() => {
        if (!isMounted) {
            // Get initial theme from localStorage or system preference
            let initialTheme: Theme = 'light';
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === 'dark' || stored === 'light') {
                initialTheme = stored;
            } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                initialTheme = 'dark';
            }

            currentTheme = initialTheme;
            applyThemeToDOM(initialTheme);
            isMounted = true;
            // Force re-render by notifying listeners
            listeners.forEach(listener => listener());
        }
    }, []);

    // Apply theme to DOM whenever theme changes (after mount)
    useLayoutEffect(() => {
        if (isMounted) {
            applyThemeToDOM(theme);
            localStorage.setItem(STORAGE_KEY, theme);
        }
    }, [theme]);

    // Listen for system preference changes
    useLayoutEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            // Only update if user hasn't explicitly set a preference
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                const newTheme = e.matches ? 'dark' : 'light';
                updateTheme(newTheme);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const setTheme = useCallback((newTheme: Theme) => {
        updateTheme(newTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        updateTheme(newTheme);
    }, []);

    // Always provide context
    const value = { theme, toggleTheme, setTheme };

    // Prevent flash of wrong theme by hiding content until mounted
    return (
        <ThemeContext.Provider value={value}>
            {isMounted ? children : (
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
