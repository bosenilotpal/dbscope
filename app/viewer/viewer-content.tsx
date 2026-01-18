'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Database, ArrowLeft, Code } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { UserProfile } from '@/components/ui/user-profile';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SchemaTree } from '@/components/features/schema-explorer/schema-tree';
import { QueryEditor } from '@/components/features/query-editor/query-editor';
import { ResultsTable } from '@/components/features/query-editor/results-table';

interface QueryResult {
  success: boolean;
  results: Record<string, unknown>[];
  columns: Array<{ name: string; type: string }>;
  rowCount: number;
  executionTime: number;
  error?: string;
}

export default function ViewerContent() {
  const searchParams = useSearchParams();
  const connectionId = searchParams.get('connectionId');
  const [queryResults, setQueryResults] = useState<QueryResult | null>(null);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!connectionId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No connection found</p>
          <Link href="/connect" className="text-blue-600 hover:underline">
            Go to Connect
          </Link>
        </div>
      </div>
    );
  }

  const executeQuery = async (query: string) => {
    setExecuting(true);
    setError(null);

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query ExecuteQuery($connectionId: ID!, $input: QueryInput!) {
              executeQuery(connectionId: $connectionId, input: $input) {
                success
                results
                columns {
                  name
                  type
                }
                rowCount
                executionTime
                error
              }
            }
          `,
          variables: {
            connectionId,
            input: {
              query,
              pageSize: 100
            }
          }
        })
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (result.data?.executeQuery) {
        const queryResult = result.data.executeQuery;

        if (!queryResult.success) {
          setError(queryResult.error || 'Query failed');
          setQueryResults(null);
        } else {
          setQueryResults(queryResult);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute query';
      setError(errorMessage);
      setQueryResults(null);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-xl flex-shrink-0 shadow-sm shadow-slate-200/50 dark:shadow-black/50 border-b border-slate-200 dark:border-slate-800">
        <div className="w-full flex h-16 items-center justify-between px-6">
          <Link href="/connect" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <Image src="/logo.jpg" alt="DBscope" width={44} height={44} className="h-11 w-11 rounded-xl" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">DBscope</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Schema Explorer */}
        <aside className="w-72 bg-white dark:bg-black flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800">
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-black border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-semibold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600/10 border border-blue-600/20">
                <Database className="h-3.5 w-3.5 text-blue-600" />
              </div>
              Schema Explorer
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-3">
            <SchemaTree connectionId={connectionId} />
          </div>
        </aside>

        {/* Center - Query Editor + Results */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Query Editor */}
          <div className="h-72 flex-shrink-0 p-4 pb-0">
            <QueryEditor
              connectionId={connectionId}
              onExecute={executeQuery}
              initialQuery="SELECT * FROM system.local LIMIT 10;"
            />
          </div>

          {/* Results */}
          <div className="flex-1 overflow-hidden p-4">
            {error ? (
              <div className="h-full flex items-center justify-center">
                <div className="max-w-2xl w-full p-6 bg-red-50 dark:bg-red-950/50 rounded-2xl shadow-lg shadow-red-100/50 dark:shadow-black/50 dark:border dark:border-red-900/50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold">!</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">Query Error</h3>
                      <pre className="text-sm text-red-700 dark:text-red-400 code-font whitespace-pre-wrap break-words">{error}</pre>
                    </div>
                  </div>
                </div>
              </div>
            ) : executing ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 border-4 border-blue-100 dark:border-blue-900/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 border-r-blue-400 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Executing query...</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Please wait</p>
                </div>
              </div>
            ) : queryResults ? (
              <div className="h-full">
                <ResultsTable
                  data={queryResults.results || []}
                  columns={queryResults.columns || []}
                  executionTime={queryResults.executionTime}
                  rowCount={queryResults.rowCount}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-600/10 to-blue-400/10 dark:from-blue-600/20 dark:to-blue-400/10 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/10 border border-blue-600/20">
                    <Code className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Ready to Execute</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Write your CQL query above and execute it</p>
                  <p className="text-xs text-slate-500 code-font bg-slate-100 dark:bg-slate-800 dark:text-slate-400 inline-block px-3 py-1 rounded-full mt-2">
                    Ctrl+Enter or click Execute
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
