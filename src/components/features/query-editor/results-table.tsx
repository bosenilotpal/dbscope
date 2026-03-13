'use client';

import { useState } from 'react';
import { Download, ChevronDown, ChevronRight } from 'lucide-react';

interface ResultsTableProps {
  data: Record<string, unknown>[];
  columns: Array<{ name: string; type: string }>;
  executionTime?: number;
  rowCount?: number;
}

export function ResultsTable({ data, columns: columnDefs, executionTime, rowCount }: ResultsTableProps) {
  const [expandedDocs, setExpandedDocs] = useState<Record<number, boolean>>({});

  const toggleDoc = (index: number) => {
    setExpandedDocs(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const renderValue = (value: unknown) => {
    if (value === null) {
      return (
        <span className="code-font text-xs text-slate-400 dark:text-slate-500 italic">
          null
        </span>
      );
    }

    if (typeof value === 'object') {
      try {
        const json = JSON.stringify(value, null, 2);
        return (
          <pre className="code-font text-[11px] leading-snug text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900/60 rounded-md px-2 py-1 max-h-40 overflow-auto border border-slate-200/80 dark:border-slate-800/80">
            {json}
          </pre>
        );
      } catch {
        return (
          <span className="code-font text-xs text-slate-700 dark:text-slate-300">
            [object]
          </span>
        );
      }
    }

    return (
      <span className="code-font text-xs text-slate-700 dark:text-slate-300">
        {String(value)}
      </span>
    );
  };

  const downloadCSV = () => {
    const headers = columnDefs.map(c => c.name).join(',');
    const rows = data.map(row =>
      columnDefs.map(c => {
        const value = row[c.name];
        return value === null ? '' : `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 font-bold text-sm">✓</span>
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Results</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-600 dark:text-slate-300 font-medium bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm">
              {rowCount} {rowCount === 1 ? 'row' : 'rows'}
            </span>
            {executionTime !== undefined && (
              <span className="text-slate-500 dark:text-slate-400 code-font bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm">
                {executionTime}ms
              </span>
            )}
          </div>
        </div>
        <button
          onClick={downloadCSV}
          disabled={data.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium shadow-md shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400 text-sm">
            No results
          </div>
        ) : (
          <div className="space-y-3 px-3 py-3 bg-slate-50/60 dark:bg-slate-950/40">
            {data.map((row, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-100/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  type="button"
                  onClick={() => toggleDoc(index)}
                  className="w-full flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedDocs[index] ? (
                      <ChevronDown className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    )}
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      Document #{index + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 code-font bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full">
                      {Object.keys(row).length} fields
                    </span>
                  </div>
                </button>

                {expandedDocs[index] !== false && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(row).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-start gap-4 px-4 py-2.5"
                      >
                        <div className="w-40 shrink-0">
                          <div className="inline-flex items-center gap-1 rounded-full bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1">
                            <span className="code-font text-[11px] font-semibold text-slate-800 dark:text-slate-100">
                              {key}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          {renderValue(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
