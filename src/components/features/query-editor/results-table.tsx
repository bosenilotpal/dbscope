'use client';

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { Download } from 'lucide-react';

interface ResultsTableProps {
  data: Record<string, unknown>[];
  columns: Array<{ name: string; type: string }>;
  executionTime?: number;
  rowCount?: number;
}

export function ResultsTable({ data, columns: columnDefs, executionTime, rowCount }: ResultsTableProps) {
  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    return columnDefs.map(col => ({
      accessorKey: col.name,
      header: () => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-white">{col.name}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal code-font">{col.type}</span>
        </div>
      ),
      cell: (info) => {
        const value = info.getValue();
        return (
          <span className="code-font text-xs text-slate-700 dark:text-slate-300">
            {value === null ? <span className="text-slate-400 dark:text-slate-500 italic">null</span> : String(value)}
          </span>
        );
      },
    }));
  }, [columnDefs]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 sticky top-0">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-2 text-left font-medium"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
