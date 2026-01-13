'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Database, ArrowLeft, Code } from 'lucide-react';
import Link from 'next/link';
import { UserProfile } from '@/components/ui/user-profile';
import { SchemaTree } from '@/components/features/schema-explorer/schema-tree';
import { QueryEditor } from '@/components/features/query-editor/query-editor';
import { ResultsTable } from '@/components/features/query-editor/results-table';

export default function ViewerContent() {
  const searchParams = useSearchParams();
  const connectionId = searchParams.get('connectionId');
  const [queryResults, setQueryResults] = useState<any>(null);
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
    } catch (err: any) {
      setError(err.message || 'Failed to execute query');
      setQueryResults(null);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm flex-shrink-0 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/connect" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <ArrowLeft className="h-4 w-4 text-slate-600" />
            <Database className="h-8 w-8 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-2xl font-bold text-transparent">
              DBscope
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 code-font bg-slate-100 px-3 py-1.5 rounded-full">
              {connectionId.substring(0, 8)}...
            </span>
            <div className="h-6 w-px bg-slate-200" />
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Schema Explorer */}
        <aside className="w-72 border-r bg-white/90 backdrop-blur-sm flex-shrink-0 flex flex-col shadow-sm">
          <div className="px-4 py-3.5 border-b bg-gradient-to-r from-slate-50 to-slate-100">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
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
          <div className="h-72 border-b flex-shrink-0 bg-white shadow-sm">
            <QueryEditor
              connectionId={connectionId}
              onExecute={executeQuery}
              initialQuery="SELECT * FROM system.local LIMIT 10;"
            />
          </div>

          {/* Results */}
          <div className="flex-1 overflow-hidden p-6 bg-gradient-to-br from-slate-50 to-white">
            {error ? (
              <div className="h-full flex items-center justify-center">
                <div className="max-w-2xl w-full p-6 bg-red-50 border-2 border-red-200 rounded-xl shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold">!</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-800 mb-2">Query Error</h3>
                      <pre className="text-sm text-red-700 code-font whitespace-pre-wrap break-words">{error}</pre>
                    </div>
                  </div>
                </div>
              </div>
            ) : executing ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-sm font-medium text-slate-700">Executing query...</p>
                  <p className="text-xs text-slate-500 mt-1">Please wait</p>
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
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center shadow-sm">
                    <Code className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Ready to Execute</h3>
                  <p className="text-sm text-slate-600 mb-1">Write your CQL query above and execute it</p>
                  <p className="text-xs text-slate-500 code-font bg-slate-100 inline-block px-3 py-1 rounded-full mt-2">
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
