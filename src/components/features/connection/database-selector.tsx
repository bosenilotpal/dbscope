'use client';

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {databases.map(db => (
          <button
            key={db.type}
            onClick={() => onSelect(db.type)}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">{db.icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition truncate">
                  {db.displayName}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
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
