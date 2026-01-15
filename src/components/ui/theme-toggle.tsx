'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/theme-context';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 group"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div className="relative w-5 h-5">
                <Sun
                    className={`absolute inset-0 h-5 w-5 text-amber-500 transition-all duration-300 ${theme === 'light'
                            ? 'rotate-0 scale-100 opacity-100'
                            : 'rotate-90 scale-0 opacity-0'
                        }`}
                />
                <Moon
                    className={`absolute inset-0 h-5 w-5 text-blue-400 transition-all duration-300 ${theme === 'dark'
                            ? 'rotate-0 scale-100 opacity-100'
                            : '-rotate-90 scale-0 opacity-0'
                        }`}
                />
            </div>
        </button>
    );
}
