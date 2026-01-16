'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, Database, Table, Columns } from 'lucide-react';

interface SchemaTreeProps {
  connectionId: string;
  onTableSelect?: (keyspace: string, table: string) => void;
}

interface Keyspace {
  name: string;
  collections_count?: number;
  tables?: Table[];
  expanded?: boolean;
}

interface Table {
  name: string;
  columns_count?: number;
  columns?: Column[];
  expanded?: boolean;
}

interface Column {
  name: string;
  type: string;
  primary_key?: boolean;
  clustering_order?: string;
}

export function SchemaTree({ connectionId, onTableSelect }: SchemaTreeProps) {
  const [keyspaces, setKeyspaces] = useState<Keyspace[]>([]);
  const [loading, setLoading] = useState(true);

  const loadKeyspaces = useCallback(async () => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query ListDatabases($connectionId: ID!) {
              listDatabases(connectionId: $connectionId) {
                name
                collections_count
              }
            }
          `,
          variables: { connectionId }
        })
      });

      const result = await response.json();
      if (result.data?.listDatabases) {
        setKeyspaces(result.data.listDatabases.map((ks: Keyspace) => ({ ...ks, expanded: false })));
      }
    } catch (error) {
      console.error('Failed to load keyspaces:', error);
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  useEffect(() => {
    loadKeyspaces();
  }, [connectionId, loadKeyspaces]);

  const toggleKeyspace = async (index: number) => {
    const ks = keyspaces[index];

    if (!ks.expanded && !ks.tables) {
      // Load tables
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query ListCollections($connectionId: ID!, $database: String!) {
                listCollections(connectionId: $connectionId, database: $database) {
                  name
                  columns_count
                }
              }
            `,
            variables: { connectionId, database: ks.name }
          })
        });

        const result = await response.json();
        if (result.data?.listCollections) {
          const updated = [...keyspaces];
          updated[index] = {
            ...ks,
            tables: result.data.listCollections.map((t: Table) => ({ ...t, expanded: false })),
            expanded: true
          };
          setKeyspaces(updated);
        }
      } catch (error) {
        console.error('Failed to load tables:', error);
      }
    } else {
      const updated = [...keyspaces];
      updated[index] = { ...ks, expanded: !ks.expanded };
      setKeyspaces(updated);
    }
  };

  const toggleTable = async (ksIndex: number, tableIndex: number) => {
    const ks = keyspaces[ksIndex];
    const table = ks.tables![tableIndex];

    if (!table.expanded && !table.columns) {
      // Load columns
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetSchema($connectionId: ID!, $database: String!, $collection: String!) {
                getSchema(connectionId: $connectionId, database: $database, collection: $collection) {
                  columns {
                    name
                    type
                    primary_key
                    clustering_order
                  }
                }
              }
            `,
            variables: { connectionId, database: ks.name, collection: table.name }
          })
        });

        const result = await response.json();
        if (result.data?.getSchema?.columns) {
          const updated = [...keyspaces];
          updated[ksIndex].tables![tableIndex] = {
            ...table,
            columns: result.data.getSchema.columns,
            expanded: true
          };
          setKeyspaces(updated);
        }
      } catch (error) {
        console.error('Failed to load columns:', error);
      }
    } else {
      const updated = [...keyspaces];
      updated[ksIndex].tables![tableIndex] = { ...table, expanded: !table.expanded };
      setKeyspaces(updated);
    }

    if (onTableSelect) {
      onTableSelect(ks.name, table.name);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {keyspaces.map((ks, ksIndex) => (
        <div key={ks.name}>
          <button
            onClick={() => toggleKeyspace(ksIndex)}
            className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors"
          >
            {ks.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Database className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{ks.name}</span>
            <span className="text-xs text-slate-500">({ks.collections_count || 0})</span>
          </button>

          {ks.expanded && ks.tables && (
            <div className="ml-6 space-y-1 mt-1">
              {ks.tables.map((table, tableIndex) => (
                <div key={table.name}>
                  <button
                    onClick={() => toggleTable(ksIndex, tableIndex)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    {table.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <Table className="h-4 w-4 text-green-600" />
                    <span>{table.name}</span>
                    <span className="text-xs text-slate-500">({table.columns_count || 0})</span>
                  </button>

                  {table.expanded && table.columns && (
                    <div className="ml-6 space-y-0.5 mt-1">
                      {table.columns.map((col) => (
                        <div
                          key={col.name}
                          className="flex items-center gap-2 px-2 py-1 text-sm text-slate-600 dark:text-slate-400"
                        >
                          <Columns className="h-3 w-3 text-slate-400" />
                          <span className="code-font text-xs text-slate-900 dark:text-slate-100 font-medium">{col.name}</span>
                          <span className="text-xs text-slate-500">{col.type}</span>
                          {col.primary_key && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">PK</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {keyspaces.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No keyspaces found
        </div>
      )}
    </div>
  );
}
