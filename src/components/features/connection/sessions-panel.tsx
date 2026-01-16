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
        className={`group relative w-full rounded-xl transition-all ${isSelected
          ? 'bg-blue-600/5 dark:bg-blue-600/10 ring-1 ring-blue-600/20 shadow-sm'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
          } p-4`}
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
              className="p-2 rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-110 active:scale-95 hover:bg-blue-700"
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
      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl animate-pulse">
        <div className="space-y-6">
          <div className="h-4 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
          <div className="space-y-3">
            <div className="h-16 rounded-xl bg-slate-200/50 dark:bg-slate-800/50"></div>
            <div className="h-16 rounded-xl bg-slate-200/50 dark:bg-slate-800/50"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-200/60 dark:border-slate-800/50 shadow-sm backdrop-blur-sm">
      <div className="space-y-10">
        {/* Pinned Sessions */}
        {pinnedProfiles.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pinned Connections</h3>
            </div>
            <div className="grid gap-2">
              {pinnedProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          </div>
        )}

        {pinnedProfiles.length > 0 && otherProfiles.length > 0 && (
          <div className="-my-2 h-px bg-slate-100 dark:bg-slate-800/50 mx-1" />
        )}

        {/* Saved Connections */}
        {otherProfiles.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <Database className="h-4 w-4 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Saved Profiles</h3>
            </div>
            <div className="grid gap-2">
              {otherProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {profiles.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <Clock className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">No connections yet</h4>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto">
              Your saved database profiles will appear here for quick access.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
