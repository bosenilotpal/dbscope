import Database from 'better-sqlite3';
import path from 'path';

// Database file location (supports Docker volume mount)
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'dbscope.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database connection
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS connection_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    database_type TEXT NOT NULL,
    host TEXT,
    port INTEGER,
    username TEXT,
    password TEXT,
    keyspace TEXT,
    database TEXT,
    local_data_center TEXT,
    description TEXT,
    is_pinned INTEGER DEFAULT 0,
    last_used_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS query_history (
    id TEXT PRIMARY KEY,
    connection_id TEXT NOT NULL,
    database_type TEXT NOT NULL,
    query_language TEXT NOT NULL,
    query TEXT NOT NULL,
    status TEXT NOT NULL,
    execution_time INTEGER,
    row_count INTEGER,
    error TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transaction_log (
    id TEXT PRIMARY KEY,
    connection_id TEXT NOT NULL,
    database_type TEXT NOT NULL,
    operation TEXT NOT NULL,
    details TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_query_history_connection ON query_history(connection_id);
  CREATE INDEX IF NOT EXISTS idx_transaction_log_connection ON transaction_log(connection_id);
`);

// Helper functions
export function generateId(): string {
  return crypto.randomUUID();
}

// Connection Profiles
export const profiles = {
  getAll: () => db.prepare('SELECT * FROM connection_profiles ORDER BY is_pinned DESC, last_used_at DESC, created_at DESC').all(),
  
  getById: (id: string) => db.prepare('SELECT * FROM connection_profiles WHERE id = ?').get(id),
  
  create: (profile: {
    name: string;
    databaseType: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    keyspace?: string;
    database?: string;
    localDataCenter?: string;
    description?: string;
  }) => {
    const id = generateId();
    db.prepare(`
      INSERT INTO connection_profiles (id, name, database_type, host, port, username, password, keyspace, database, local_data_center, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, profile.name, profile.databaseType, profile.host, profile.port, profile.username, profile.password, profile.keyspace, profile.database, profile.localDataCenter, profile.description);
    return { id, ...profile };
  },
  
  update: (id: string, profile: Partial<{
    name: string;
    host: string;
    port: number;
    username: string;
    password: string;
    keyspace: string;
    localDataCenter: string;
  }>) => {
    const sets: string[] = [];
    const values: any[] = [];
    
    if (profile.name !== undefined) { sets.push('name = ?'); values.push(profile.name); }
    if (profile.host !== undefined) { sets.push('host = ?'); values.push(profile.host); }
    if (profile.port !== undefined) { sets.push('port = ?'); values.push(profile.port); }
    if (profile.username !== undefined) { sets.push('username = ?'); values.push(profile.username); }
    if (profile.password !== undefined) { sets.push('password = ?'); values.push(profile.password); }
    if (profile.keyspace !== undefined) { sets.push('keyspace = ?'); values.push(profile.keyspace); }
    if (profile.localDataCenter !== undefined) { sets.push('local_data_center = ?'); values.push(profile.localDataCenter); }
    
    sets.push("updated_at = datetime('now')");
    values.push(id);
    
    db.prepare(`UPDATE connection_profiles SET ${sets.join(', ')} WHERE id = ?`).run(...values);
    return profiles.getById(id);
  },
  
  delete: (id: string) => {
    db.prepare('DELETE FROM connection_profiles WHERE id = ?').run(id);
    return { success: true };
  },
  
  togglePin: (id: string) => {
    const profile = profiles.getById(id) as any;
    if (!profile) throw new Error('Profile not found');
    const newPinned = profile.is_pinned ? 0 : 1;
    db.prepare('UPDATE connection_profiles SET is_pinned = ?, updated_at = datetime(\'now\') WHERE id = ?').run(newPinned, id);
    return profiles.getById(id);
  },
  
  updateLastUsed: (id: string) => {
    db.prepare('UPDATE connection_profiles SET last_used_at = datetime(\'now\'), updated_at = datetime(\'now\') WHERE id = ?').run(id);
    return profiles.getById(id);
  }
};

// Query History
export const queryHistory = {
  getByConnection: (connectionId: string, limit = 100) => 
    db.prepare('SELECT * FROM query_history WHERE connection_id = ? ORDER BY created_at DESC LIMIT ?').all(connectionId, limit),
  
  create: (entry: {
    connectionId: string;
    databaseType: string;
    queryLanguage: string;
    query: string;
    status: string;
    executionTime?: number;
    rowCount?: number;
    error?: string;
  }) => {
    const id = generateId();
    db.prepare(`
      INSERT INTO query_history (id, connection_id, database_type, query_language, query, status, execution_time, row_count, error)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, entry.connectionId, entry.databaseType, entry.queryLanguage, entry.query, entry.status, entry.executionTime, entry.rowCount, entry.error);
    return { id, ...entry };
  }
};

// Transaction Log
export const transactionLog = {
  create: (entry: {
    connectionId: string;
    databaseType: string;
    operation: string;
    details?: string;
  }) => {
    const id = generateId();
    db.prepare(`
      INSERT INTO transaction_log (id, connection_id, database_type, operation, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, entry.connectionId, entry.databaseType, entry.operation, entry.details);
    return { id, ...entry };
  },
  
  getByConnection: (connectionId: string) =>
    db.prepare('SELECT * FROM transaction_log WHERE connection_id = ? ORDER BY created_at DESC').all(connectionId)
};

export default db;
