'use client';

import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Code } from 'lucide-react';
import { useTheme } from '@/context/theme-context';

interface QueryEditorProps {
  connectionId: string;
  onExecute?: (query: string) => void;
  initialQuery?: string;
}

export function QueryEditor({ onExecute, initialQuery = '' }: QueryEditorProps) {
  const [query, setQuery] = useState(initialQuery);
  const [executing, setExecuting] = useState(false);
  const editorRef = useRef<unknown>(null);
  const { theme } = useTheme();

  const handleEditorDidMount = (editor: unknown) => {
    editorRef.current = editor;
  };

  const executeQuery = async () => {
    if (!query.trim() || executing) return;

    setExecuting(true);
    if (onExecute) {
      onExecute(query);
    }

    // Execution happens in parent component
    setTimeout(() => setExecuting(false), 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Enter or Cmd+Enter to execute
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeQuery();
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
            <Code className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Query Editor</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 code-font bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg">CQL</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={executeQuery}
            disabled={executing || !query.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30"
          >
            <Play className="h-3.5 w-3.5" />
            Execute
          </button>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 code-font hidden sm:inline">
            Ctrl + Enter
          </span>
        </div>
      </div>

      <div className="flex-1" onKeyDown={handleKeyDown}>
        <Editor
          height="100%"
          defaultLanguage="sql"
          value={query}
          onChange={(value) => setQuery(value || '')}
          onMount={handleEditorDidMount}
          theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
}
