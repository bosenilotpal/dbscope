'use client';

import { useState, useEffect } from 'react';
import { Clock, PlayCircle, XCircle, CheckCircle } from 'lucide-react';

interface QueryHistoryProps {
  connectionId?: string;
}

interface HistoryItem {
  id: string;
  query: string;
  status: string;
  executionTime: number;
  rowCount?: number;
  error?: string;
  createdAt: string;
}

export function QueryHistory({ connectionId }: QueryHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');

  useEffect(() => {
    if (connectionId) {
      loadHistory();
    }
  }, [connectionId]);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetQueryHistory($connectionId: ID!) {
              getQueryHistory(connectionId: $connectionId) {
                id
                query
                queryLanguage
                status
                executionTime
                rowCount
                error
                createdAt
              }
            }
          `,
          variables: { connectionId }
        })
      });

      const result = await response.json();
      if (result.data?.getQueryHistory) {
        setHistory(result.data.getQueryHistory);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const copyToClipboard = (query: string) => {
    navigator.clipboard.writeText(query);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-600" />
          Query History
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs rounded-full transition ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('success')}
            className={`px-3 py-1 text-xs rounded-full transition ${
              filter === 'success' 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Success
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-3 py-1 text-xs rounded-full transition ${
              filter === 'error' 
                ? 'bg-red-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Errors
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No query history yet
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-white border rounded-lg hover:shadow-sm transition cursor-pointer"
              onClick={() => copyToClipboard(item.query)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {item.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  )}
                  <span className="text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 code-font">{item.executionTime}ms</span>
                  {item.rowCount !== undefined && (
                    <span className="text-slate-500">{item.rowCount} rows</span>
                  )}
                </div>
              </div>
              <pre className="text-xs code-font text-slate-700 line-clamp-2 whitespace-pre-wrap break-words">
                {item.query}
              </pre>
              {item.error && (
                <p className="text-xs text-red-600 mt-2 truncate">{item.error}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
