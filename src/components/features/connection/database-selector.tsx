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
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Database Type</h3>
        <p className="text-sm text-gray-600">Choose the database you want to connect to</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {databases.map(db => (
          <button
            key={db.type}
            onClick={() => onSelect(db.type)}
            className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{db.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition">
                  {db.displayName}
                </h4>
                <div className="flex flex-wrap gap-1 mt-2">
                  {db.capabilities.supportsAggregation && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Aggregation
                    </span>
                  )}
                  {db.capabilities.supportsIndexes && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      Indexes
                    </span>
                  )}
                  {db.capabilities.supportsTransactions && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      Transactions
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2 code-font">
                  {db.capabilities.queryLanguage.toUpperCase()}
                </p>
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
