'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ConnectionFormProps {
  databaseType: string;
}

export function ConnectionForm({ databaseType }: ConnectionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveProfile, setSaveProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [formData, setFormData] = useState({
    host: 'localhost',
    port: databaseType === 'cassandra' ? 9042 : 27017,
    username: '',
    password: '',
    keyspace: '',
    localDataCenter: 'datacenter1'
  });

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

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2">Host</label>
          <input
            type="text"
            value={formData.host}
            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
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

        {databaseType === 'cassandra' && (
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
