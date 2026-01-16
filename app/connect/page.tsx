'use client';

import { useState } from 'react';
import { DatabaseSelector } from '@/components/features/connection/database-selector';
import { ConnectionForm } from '@/components/features/connection/connection-form';
import { SessionsPanel } from '@/components/features/connection/sessions-panel';
import { Database, Plus } from 'lucide-react';
import Link from 'next/link';
import { UserProfile } from '@/components/ui/user-profile';
import { Modal } from '@/components/ui/modal';

interface ConnectionProfile {
  id: string;
  name: string;
  database_type: string;
  host?: string;
  port?: number;
  is_pinned?: number;
  last_used_at?: string;
  created_at?: string;
}

export default function ConnectPage() {
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ConnectionProfile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoConnect, setAutoConnect] = useState(false);

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleProfileSelect = (profile: ConnectionProfile) => {
    setSelectedDatabase(profile.database_type);
    setSelectedProfile(profile);
    setAutoConnect(false);
    setIsFormOpen(true);
  };

  const handleQuickConnect = (profile: ConnectionProfile) => {
    setSelectedDatabase(profile.database_type);
    setSelectedProfile(profile);
    setAutoConnect(true);
    setIsFormOpen(true);
  };

  const handleDatabaseSelect = (type: string) => {
    setSelectedDatabase(type);
    setSelectedProfile(null);
    setAutoConnect(false);
    setIsSelectorOpen(false);
    setIsFormOpen(true);
  };

  const handleProfileSaved = () => {
    setRefreshKey(prev => prev + 1);
    setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-black dark:via-black dark:to-black">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/connect" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-600/25">
              <Database className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">DBscope</span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSelectorOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md shadow-blue-600/20"
            >
              <Plus className="h-4 w-4" />
              New Connection
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="mb-2 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-4xl font-bold text-transparent">
                Connections
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your saved database profiles and sessions
              </p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            {/* Left: Main Sessions Panel Area */}
            <div className="space-y-6">
              <SessionsPanel
                key={refreshKey}
                onSelectProfile={handleProfileSelect}
                onQuickConnect={handleQuickConnect}
                selectedProfileId={selectedProfile?.id}
              />
            </div>

            {/* Right: Quick Stats/Info (Optional but adds to UI richness) */}
            <aside className="space-y-6 hidden lg:block">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  Quick Info
                </h3>
                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                  <p>
                    Select an existing profile from the list to edit or connect.
                  </p>
                  <p>
                    Use the <strong>Quick Connect</strong> play button to join immediately.
                  </p>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-1">
                      <span>Saved Profiles</span>
                      <span className="font-bold text-slate-900 dark:text-white">Active</span>
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      Profiles are stored securely in your local environment.
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Modals */}
      <Modal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        title="Choose Database Type"
        description="Select the type of database you want to connect to"
        maxWidth="2xl"
      >
        <DatabaseSelector onSelect={handleDatabaseSelect} />
      </Modal>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedProfile ? "Edit Connection" : "New Connection"}
        description={selectedProfile ? `Updating settings for ${selectedProfile.name}` : "Enter your database credentials"}
        maxWidth="2xl"
      >
        {selectedDatabase && (
          <ConnectionForm
            databaseType={selectedDatabase}
            profile={selectedProfile}
            onProfileSaved={handleProfileSaved}
            autoConnect={autoConnect}
          />
        )}
      </Modal>
    </div>
  );
}
