'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ConnectionFormProps {
  databaseType: string;
  profile?: any; // Pre-fill from selected profile
  onProfileSaved?: () => void;
  autoConnect?: boolean;
}

export function ConnectionForm({ databaseType, profile, onProfileSaved, autoConnect }: ConnectionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; executionTime: number } | null>(null);
  const [saveProfile, setSaveProfile] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
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
      setSaveProfile(false); // Only check if user wants to explicitly update
      setIsDockerized(profile.host === 'host.docker.internal');
    }
  }, [profile, databaseType]);

  // Handle auto-connect
  useEffect(() => {
    if (autoConnect && !loading) {
      const timer = setTimeout(() => {
        const form = document.querySelector('form');
        if (form) form.requestSubmit();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoConnect, loading]);

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

        // Save or Update profile if requested
        if (saveProfile && profileName.trim()) {
          try {
            const isUpdate = !!profile?.id;
            const endpoint = isUpdate ? `/api/profiles/${profile.id}` : '/api/profiles';
            const method = isUpdate ? 'PUT' : 'POST';

            await fetch(endpoint, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: profileName.trim(),
                databaseType: databaseType,
                ...formData
              })
            });
          } catch (err) {
            console.error('Failed to save/update profile:', err);
          }
        }

        // Notify parent that profile might have changed/newly created
        onProfileSaved?.();

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

  const handleSave = async () => {
    if (!profileName.trim()) {
      setError('Profile name is required');
      return;
    }
    if (!profile?.id) return;

    setSaveLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/profiles/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName.trim(),
          databaseType: databaseType,
          ...formData
        })
      });

      if (!response.ok) throw new Error('Failed to update profile');

      onProfileSaved?.();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile changes');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query TestConnection($type: DatabaseType!, $input: ConnectionInput!) {
              testConnection(type: $type, input: $input) {
                success
                status
                message
                execution_time
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

      const testData = result.data.testConnection;
      setTestResult({
        success: testData.success,
        message: testData.message,
        executionTime: testData.execution_time
      });

      if (!testData.success) {
        setError(testData.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to test connection');
      setTestResult({
        success: false,
        message: err.message || 'Failed to test connection',
        executionTime: 0
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-1">
        {profile && (
          <div className="mb-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-0.5">Profile Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g., Production"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              required
            />
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Failed</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {testResult && testResult.success && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle className="text-slate-900">Connection Successful</AlertTitle>
          <AlertDescription className="text-slate-600">
            {testResult.message}
            <div className="text-xs mt-1 text-slate-500">
              Response time: {testResult.executionTime}ms
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Docker Toggle */}
      <div className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
        <Container className="h-4 w-4 text-blue-600" />
        <label className="flex flex-1 items-center justify-between cursor-pointer">
          <div>
            <div className="text-sm font-semibold text-slate-900">Dockerized Database</div>
            <div className="text-xs text-slate-500 mt-0.5">Auto-configure for Docker networking</div>
          </div>
          <div className="relative inline-block w-9 h-5">
            <input
              type="checkbox"
              checked={isDockerized}
              onChange={(e) => setIsDockerized(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>
      </div>

      <div className="grid gap-x-4 gap-y-3 md:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 ml-0.5">Host</label>
          <input
            type="text"
            value={formData.host}
            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            disabled={isDockerized}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5 ml-0.5">Port</label>
          <input
            type="number"
            value={formData.port || ''}
            onChange={(e) => {
              const value = e.target.value === '' ? '' : parseInt(e.target.value);
              setFormData({ ...formData, port: value === '' ? (databaseType === 'cassandra' || databaseType === 'scylladb' ? 9042 : 27017) : value });
            }}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5 ml-0.5">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5 ml-0.5">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {(databaseType === 'cassandra' || databaseType === 'scylladb') && (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5 ml-0.5">Keyspace</label>
              <input
                type="text"
                value={formData.keyspace}
                onChange={(e) => setFormData({ ...formData, keyspace: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5 ml-0.5">Data Center</label>
              <input
                type="text"
                value={formData.localDataCenter}
                onChange={(e) => setFormData({ ...formData, localDataCenter: e.target.value })}
                className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </>
        )}
      </div>

      {!profile && (
        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={saveProfile}
              onChange={(e) => setSaveProfile(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">Save profile</span>
          </label>

          {saveProfile && (
            <div className="mt-2 pl-5">
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Profile Name..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required={saveProfile}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 pt-5 border-t">
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testLoading || loading || saveLoading}
          className="px-5 py-2.5 border border-slate-300 rounded-lg font-bold text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {testLoading ? 'Testing...' : 'Test Connection'}
        </button>

        <div className="flex-1" />

        {profile && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saveLoading || loading}
            className="px-5 py-2.5 bg-white border border-blue-600 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </button>
        )}

        <button
          type="submit"
          disabled={loading || saveLoading}
          className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-600/20"
        >
          {loading ? 'Connecting...' : 'Connect'}
        </button>
      </div>
    </form>
  );
}
