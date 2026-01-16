import Database from 'better-sqlite3';
import path from 'path';

// Database file location (supports Docker volume mount)
const isVercel = process.env.VERCEL === '1';
const dbPath = process.env.DATABASE_PATH || (isVercel
  ? path.join('/tmp', 'dbscope.db')
  : path.join(process.cwd(), 'data', 'dbscope.db'));

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create data directory, might be in a read-only environment:', e);
}

// Initialize database connection
let db: Database.Database;
try {
  db = new Database(dbPath);
} catch (e) {
  console.error('Failed to initialize database:', e);
  // Fallback or mock if needed, but for now we let it fail gracefully
  // or provide a minimal interface to avoid crashes
  db = {
    prepare: () => ({
      all: () => [],
      get: () => null,
      run: () => ({ changes: 0, lastInsertRowid: 0 })
    }),
    exec: () => { },
    pragma: () => { }
  } as unknown as Database.Database;
}

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    email TEXT UNIQUE,
    google_id TEXT UNIQUE,
    github_id TEXT UNIQUE,
    avatar_url TEXT,
    first_name TEXT,
    last_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

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
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
`);

// Migration: Add new columns to existing users table if they don't exist
try {
  // Check if google_id column exists
  const tableInfo = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  const columnNames = tableInfo.map(col => col.name);

  if (!columnNames.includes('google_id')) {
    db.exec('ALTER TABLE users ADD COLUMN google_id TEXT');
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)');
    console.log('✅ Migration: Added google_id column to users table');
  }

  if (!columnNames.includes('avatar_url')) {
    db.exec('ALTER TABLE users ADD COLUMN avatar_url TEXT');
    console.log('✅ Migration: Added avatar_url column to users table');
  }

  if (!columnNames.includes('first_name')) {
    db.exec('ALTER TABLE users ADD COLUMN first_name TEXT');
    console.log('✅ Migration: Added first_name column to users table');
  }

  if (!columnNames.includes('last_name')) {
    db.exec('ALTER TABLE users ADD COLUMN last_name TEXT');
    console.log('✅ Migration: Added last_name column to users table');
  }

  if (!columnNames.includes('github_id')) {
    db.exec('ALTER TABLE users ADD COLUMN github_id TEXT');
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id)');
    console.log('✅ Migration: Added github_id column to users table');
  }
} catch (e) {
  console.warn('⚠️ Migration check skipped:', e);
}

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
    const values: (string | number | undefined)[] = [];

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
    const profile = profiles.getById(id) as { is_pinned?: number } | undefined;
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

// Users
export const users = {
  getAll: () => db.prepare('SELECT id, username, email, avatar_url, first_name, last_name, is_active, created_at FROM users').all(),

  getByUsername: (username: string) => db.prepare('SELECT * FROM users WHERE username = ?').get(username),

  getByEmail: (email: string) => db.prepare('SELECT * FROM users WHERE email = ?').get(email),

  getByGoogleId: (googleId: string) => db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId),

  getById: (id: string) => db.prepare('SELECT id, username, email, avatar_url, first_name, last_name, is_active, created_at FROM users WHERE id = ?').get(id),

  create: (user: {
    username: string;
    passwordHash: string;
    email?: string;
  }) => {
    const id = generateId();
    db.prepare(`
      INSERT INTO users (id, username, password_hash, email)
      VALUES (?, ?, ?, ?)
    `).run(id, user.username, user.passwordHash, user.email);
    return { id, username: user.username, email: user.email };
  },

  createFromGoogle: (user: {
    email: string;
    googleId: string;
    name: string;
    avatarUrl?: string;
    firstName?: string;
    lastName?: string;
  }) => {
    const id = generateId();
    // Use email prefix as username, ensuring uniqueness
    let username = user.email.split('@')[0];
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      username = `${username}_${Date.now().toString(36)}`;
    }
    db.prepare(`
      INSERT INTO users (id, username, password_hash, email, google_id, avatar_url, first_name, last_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, username, '', user.email, user.googleId, user.avatarUrl, user.firstName, user.lastName);
    return { id, username, email: user.email, avatar_url: user.avatarUrl };
  },

  linkGoogleAccount: (userId: string, googleId: string, avatarUrl?: string) => {
    db.prepare(`
      UPDATE users SET google_id = ?, avatar_url = COALESCE(?, avatar_url), updated_at = datetime('now') WHERE id = ?
    `).run(googleId, avatarUrl, userId);
    return users.getById(userId);
  },

  getByGithubId: (githubId: string) => db.prepare('SELECT * FROM users WHERE github_id = ?').get(githubId),

  createFromGithub: (user: {
    email: string;
    githubId: string;
    name: string;
    username: string;
    avatarUrl?: string;
  }) => {
    const id = generateId();
    // Use GitHub username, ensuring uniqueness
    let username = user.username;
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      username = `${username}_${Date.now().toString(36)}`;
    }
    db.prepare(`
      INSERT INTO users (id, username, password_hash, email, github_id, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, username, '', user.email, user.githubId, user.avatarUrl);
    return { id, username, email: user.email, avatar_url: user.avatarUrl };
  },

  linkGithubAccount: (userId: string, githubId: string, avatarUrl?: string) => {
    db.prepare(`
      UPDATE users SET github_id = ?, avatar_url = COALESCE(?, avatar_url), updated_at = datetime('now') WHERE id = ?
    `).run(githubId, avatarUrl, userId);
    return users.getById(userId);
  },

  updatePassword: (id: string, passwordHash: string) => {
    db.prepare(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`).run(passwordHash, id);
    return users.getById(id);
  },

  updateUsername: (id: string, username: string) => {
    db.prepare(`UPDATE users SET username = ?, updated_at = datetime('now') WHERE id = ?`).run(username, id);
    return users.getById(id);
  },

  updateProfile: (id: string, data: { firstName?: string; lastName?: string }) => {
    const sets = [];
    const values = [];
    if (data.firstName !== undefined) { sets.push('first_name = ?'); values.push(data.firstName); }
    if (data.lastName !== undefined) { sets.push('last_name = ?'); values.push(data.lastName); }

    if (sets.length === 0) return users.getById(id);

    sets.push("updated_at = datetime('now')");
    values.push(id);

    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...values);
    return users.getById(id);
  },

  delete: (id: string) => {
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return { success: true };
  }
};

// Auto-seed admin user if none exists
try {
  const admin = users.getByUsername('admin');
  if (!admin) {
    console.log('🌱 No admin user found. Provisioning default account...');
    // Pre-computed bcrypt hash for password 'admin'
    const id = generateId();
    db.prepare(`
      INSERT INTO users (id, username, password_hash, email)
      VALUES (?, ?, ?, ?)
    `).run(id, 'admin', '$2b$10$T1Iiz7UU227KPa9g/NGanOCKB7nv0fHhIhA2pdhB9GlbrPoa7iI26', 'admin@dbscope.local');
    console.log('✅ Default admin provisioned: admin / admin');
  }
} catch (e) {
  console.warn('⚠️ Seeding skipped:', e);
}

export default db;
