'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from 'lucide-react';

interface ConnectionFormProps {
  databaseType: string;
  profile?: any; // Pre-fill from selected profile
}

export function ConnectionForm({ databaseType, profile }: ConnectionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveProfile, setSaveProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [isDockerized, setIsDockerized] = useState(false);
  const [formData, setFormData] = useState({
    host: 'localhost',
    port: databaseType === 'cassandra' || databaseType === 'scylladb' ? 9042 : 27017,
    username: '',
    password: '',
    keyspace: '',
    localDataCenter: 'datacenter1'
  });

  // Pre-fill form if profile is provided
  useEffect(() => {
    if (profile) {
      setFormData({
        host: profile.host || 'localhost',
        port: profile.port || (databaseType === 'cassandra' || databaseType === 'scylladb' ? 9042 : 27017),
        username: profile.username || '',
        password: profile.password || '',
        keyspace: profile.keyspace || '',
        localDataCenter: profile.local_data_center || 'datacenter1'
      });
      setProfileName(profile.name || '');
    }
  }, [profile, databaseType]);

  // Update host when Docker toggle changes
  useEffect(() => {
    if (isDockerized) {
      setFormData(prev => ({ ...prev, host: 'host.docker.internal' }));
    }
  }, [isDockerized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation Connect($type: DatabaseType!, $input: ConnectionInput!) {
              connect(type: $type, input: $input) {
                connectionId
                status
                message
              }
            }
          `,
          variables: {
            type: databaseType.toUpperCase(),
            input: formData
          }
        })
      });

      const result = await response.json();

      if (result.errors) {
        const errorMsg = result.errors[0].message;
        
        // Parse common error types
        if (errorMsg.includes('timeout') || errorMsg.includes('did not reply')) {
          throw new Error('Connection timeout. Please check if the database is running and the host/port are correct.');
        } else if (errorMsg.includes('Connection refused')) {
          throw new Error('Connection refused. The database might not be running on the specified host:port.');
        } else if (errorMsg.includes('authentication') || errorMsg.includes('credentials')) {
          throw new Error('Authentication failed. Please check your username and password.');
        } else {
          throw new Error(errorMsg);
        }
      }

      if (result.data.connect.status === 'connected') {
        const connectionId = result.data.connect.connectionId;
        
        // Update last_used_at if using an existing profile
        if (profile?.id) {
          try {
            await fetch(`/api/profiles/${profile.id}/use`, { method: 'POST' });
          } catch (err) {
            console.error('Failed to update last used:', err);
          }
        }
        
        // Save profile if requested
        if (saveProfile && profileName.trim()) {
          try {
            await fetch('/api/profiles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: profileName.trim(),
                databaseType: databaseType,
                ...formData
              })
            });
          } catch (err) {
            console.error('Failed to save profile:', err);
          }
        }
        
        // Store connection ID and redirect to viewer
        sessionStorage.setItem('connectionId', connectionId);
        sessionStorage.setItem('databaseType', databaseType);
        router.push(`/viewer?connectionId=${connectionId}`);
      } else {
        throw new Error(result.data.connect.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {databaseType === 'cassandra' ? 'Cassandra' : databaseType} Connection
        </h3>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Docker Toggle */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Container className="h-5 w-5 text-blue-600" />
        <label className="flex flex-1 items-center justify-between cursor-pointer">
          <div>
            <div className="text-sm font-medium text-slate-900">Dockerized Database</div>
            <div className="text-xs text-slate-600 mt-0.5">Auto-configure for Docker networking</div>
          </div>
          <div className="relative inline-block w-11 h-6">
            <input
              type="checkbox"
              checked={isDockerized}
              onChange={(e) => setIsDockerized(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2">Host</label>
          <input
            type="text"
            value={formData.host}
            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isDockerized}
            required
          />
          {isDockerized && (
            <p className="mt-1 text-xs text-blue-600">Using host.docker.internal for Docker networking</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Port</label>
          <input
            type="number"
            value={formData.port}
            onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {(databaseType === 'cassandra' || databaseType === 'scylladb') && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Keyspace (optional)</label>
              <input
                type="text"
                value={formData.keyspace}
                onChange={(e) => setFormData({ ...formData, keyspace: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Local Data Center</label>
              <input
                type="text"
                value={formData.localDataCenter}
                onChange={(e) => setFormData({ ...formData, localDataCenter: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}
      </div>

      <div className="border-t pt-4 mt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={saveProfile}
            onChange={(e) => setSaveProfile(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">Save this connection profile</span>
        </label>
        
        {saveProfile && (
          <div className="mt-3">
            <label className="block text-sm font-medium mb-2">Profile Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g., Production Cassandra"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={saveProfile}
            />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Connecting...' : 'Connect'}
        </button>

        <button
          type="button"
          onClick={() => {
            // Test connection without saving
            setError(null);
            alert('Test connection feature coming soon');
          }}
          className="px-6 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition"
        >
          Test Connection
        </button>
      </div>
    </form>
  );
}
