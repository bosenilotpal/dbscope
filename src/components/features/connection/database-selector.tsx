'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Database } from 'lucide-react';

interface DatabaseSupport {
  type: string;
  displayName: string;
  icon: string;
  capabilities: {
    supportsKeyspaces: boolean;
    supportsIndexes: boolean;
    supportsAggregation: boolean;
    supportsTransactions: boolean;
    queryLanguage: string;
    schemaType: string;
  };
}

interface DatabaseSelectorProps {
  onSelect: (type: string) => void;
}

export function DatabaseSelector({ onSelect }: DatabaseSelectorProps) {
  const [databases, setDatabases] = useState<DatabaseSupport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/databases')
      .then(res => res.json())
      .then(data => {
        setDatabases(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch databases:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // Check if icon is an SVG path or emoji
  const isIconPath = (icon: string) => icon.startsWith('/') || icon.startsWith('http');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {databases.map(db => (
          <button
            key={db.type}
            onClick={() => onSelect(db.type)}
            className="p-5 bg-card rounded-xl shadow-sm transition-all text-left group border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-md dark:hover:shadow-none"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 h-14 w-14 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-gradient-to-br group-hover:from-blue-600/10 group-hover:to-blue-400/10 dark:group-hover:from-blue-900/40 dark:group-hover:to-blue-800/20 transition-all duration-300">
                {isIconPath(db.icon) ? (
                  <Image
                    src={db.icon}
                    alt={db.displayName}
                    width={36}
                    height={36}
                    className="transition-transform group-hover:scale-110"
                  />
                ) : (
                  <span className="text-3xl transition-transform group-hover:scale-110">{db.icon}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {db.displayName}
                </h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-gradient-to-r group-hover:from-blue-600/10 group-hover:to-blue-400/10 group-hover:text-blue-600 dark:group-hover:text-blue-300 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider transition-all duration-300">
                    {db.capabilities.queryLanguage}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {databases.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No database adapters available</p>
        </div>
      )}
    </div>
  );
}
