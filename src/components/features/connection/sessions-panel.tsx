'use client';

import { useState, useEffect } from 'react';
import { Pin, Clock, Star, Trash2, Database, Play, ExternalLink } from 'lucide-react';

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
  onQuickConnect: (profile: ConnectionProfile) => void;
  selectedProfileId?: string;
}

export function SessionsPanel({ onSelectProfile, onQuickConnect, selectedProfileId }: SessionsPanelProps) {
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this profile?')) return;

    try {
      await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
      fetchProfiles();
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };

  const pinnedProfiles = profiles.filter((p) => p.is_pinned);
  const otherProfiles = profiles.filter((p) => !p.is_pinned);

  const ProfileCard = ({ profile }: { profile: ConnectionProfile }) => {
    const isSelected = selectedProfileId === profile.id;

    return (
      <div
        className={`group relative w-full rounded-lg border p-4 transition-all ${isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
          : 'border-border bg-card hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
          }`}
      >
        <div className="flex items-start justify-between">
          <button
            onClick={() => onSelectProfile(profile)}
            className="flex-1 text-left"
          >
            <div className="flex items-center gap-2">
              <div className={`font-medium ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-foreground'}`}>
                {profile.name}
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isSelected ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-100' : 'bg-muted text-muted-foreground'
                }`}>
                {profile.database_type}
              </span>
            </div>
            <div className={`mt-1 text-sm ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-muted-foreground'}`}>
              {profile.host}:{profile.port}
            </div>
          </button>

          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onQuickConnect(profile)}
              title="Quick Connect"
              className="rounded p-1.5 text-blue-600 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              <Play className="h-4 w-4 fill-current" />
            </button>
            <button
              onClick={() => onSelectProfile(profile)}
              title="Edit Profile"
              className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => handleTogglePin(profile.id, e)}
              title={profile.is_pinned ? "Unpin" : "Pin"}
              className="rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Pin className={`h-4 w-4 ${profile.is_pinned ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300 dark:text-slate-600 hover:text-yellow-500'}`} />
            </button>
            <button
              onClick={(e) => handleDelete(profile.id, e)}
              title="Delete Profile"
              className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/3 rounded bg-muted"></div>
          <div className="space-y-2">
            <div className="h-12 rounded bg-muted/50"></div>
            <div className="h-12 rounded bg-muted/50"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Pinned Sessions */}
      {pinnedProfiles.length > 0 && (
        <div className="border-b border-border p-6">
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold text-foreground">Pinned</h3>
          </div>
          <div className="space-y-2">
            {pinnedProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </div>
      )}

      {/* Saved Connections */}
      {otherProfiles.length > 0 && (
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Saved Connections</h3>
          </div>
          <div className="space-y-2">
            {otherProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {profiles.length === 0 && (
        <div className="p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Clock className="h-6 w-6 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">No saved connections yet</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-600">Connect to a database to save your session</p>
        </div>
      )}
    </div>
  );
}
