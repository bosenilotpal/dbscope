'use client';

import { useState, useEffect } from 'react';
import { Pin, Clock, Star } from 'lucide-react';

interface ConnectionProfile {
  id: string;
  name: string;
  database_type: string;
  host?: string;
  port?: number;
  is_pinned?: number;
  last_used_at?: string;
  created_at: string;
}

interface SessionsPanelProps {
  onSelectProfile: (profile: ConnectionProfile) => void;
}

export function SessionsPanel({ onSelectProfile }: SessionsPanelProps) {
  const [profiles, setProfiles] = useState<ConnectionProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/profiles/${id}/pin`, { method: 'POST' });
      fetchProfiles(); // Refresh list
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const pinnedProfiles = profiles.filter((p) => p.is_pinned);
  const recentProfiles = profiles.filter((p) => !p.is_pinned && p.last_used_at).slice(0, 5);

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/3 rounded bg-slate-200"></div>
          <div className="space-y-2">
            <div className="h-12 rounded bg-slate-100"></div>
            <div className="h-12 rounded bg-slate-100"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      {/* Pinned Sessions */}
      {pinnedProfiles.length > 0 && (
        <div className="border-b p-6">
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold text-slate-900">Pinned</h3>
          </div>
          <div className="space-y-2">
            {pinnedProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => onSelectProfile(profile)}
                className="group relative w-full rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-slate-900">{profile.name}</div>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {profile.database_type}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {profile.host}:{profile.port}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleTogglePin(profile.id, e)}
                    className="rounded p-1.5 transition-colors hover:bg-slate-100"
                  >
                    <Pin className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {recentProfiles.length > 0 && (
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">Recent</h3>
          </div>
          <div className="space-y-2">
            {recentProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => onSelectProfile(profile)}
                className="group relative w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition-all hover:border-blue-200 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-slate-900">{profile.name}</div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {profile.database_type}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {profile.host}:{profile.port}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleTogglePin(profile.id, e)}
                    className="rounded p-1.5 transition-colors hover:bg-slate-100"
                  >
                    <Pin className="h-4 w-4 text-slate-300 hover:text-yellow-500" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {profiles.length === 0 && (
        <div className="p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Clock className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-600">No saved connections yet</p>
          <p className="mt-1 text-xs text-slate-500">Connect to a database to save your session</p>
        </div>
      )}
    </div>
  );
}
