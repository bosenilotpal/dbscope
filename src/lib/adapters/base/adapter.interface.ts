/**
 * Database Adapter Base Interface
 * 
 * All database adapters must implement this interface to ensure
 * consistent behavior across different NoSQL databases.
 */

export enum DatabaseType {
  CASSANDRA = 'cassandra',
  SCYLLADB = 'scylladb',
  MONGODB = 'mongodb',
  DYNAMODB = 'dynamodb',
  REDIS = 'redis',
  COUCHBASE = 'couchbase'
}

export enum QueryLanguage {
  CQL = 'cql',           // Cassandra Query Language
  MQL = 'mql',           // MongoDB Query Language
  PARTIQL = 'partiql',   // AWS DynamoDB
  REDIS = 'redis',       // Redis commands
  N1QL = 'n1ql'          // Couchbase
}

export enum SchemaType {
  SCHEMALESS = 'schemaless',           // No enforced schema (Redis)
  SCHEMA_OPTIONAL = 'schema-optional', // Optional schema (MongoDB)
  SCHEMA_REQUIRED = 'schema-required'  // Required schema (Cassandra)
}

export interface DatabaseCapabilities {
  supportsKeyspaces: boolean;      // Cassandra: yes, MongoDB: no
  supportsIndexes: boolean;
  supportsAggregation: boolean;
  supportsTransactions: boolean;
  queryLanguage: QueryLanguage;
  schemaType: SchemaType;
}

export interface ConnectionConfig {
  // Common fields
  host?: string;
  port?: number;
  uri?: string;              // For connection string-based DBs
  
  // Authentication
  username?: string;
  password?: string;
  accessKey?: string;        // AWS
  secretKey?: string;        // AWS
  
  // Database-specific
  keyspace?: string;         // Cassandra
  database?: string;         // MongoDB, general purpose
  region?: string;           // AWS DynamoDB
  localDataCenter?: string;  // Cassandra
}

export interface ConnectionResult {
  connectionId: string;
  status: 'connected' | 'failed';
  message: string;
  execution_time?: number;
}

export interface TestResult {
  success: boolean;
  status: 'success' | 'failed';
  message: string;
  execution_time: number;
}

export interface DatabaseInfo {
  name: string;
  collections_count?: number;
  size?: string;
}

export interface CollectionInfo {
  name: string;
  type?: string;
  documents_count?: number;
  columns_count?: number;    // For Cassandra tables
}

export interface ColumnInfo {
  name: string;
  type: string;
  primary_key?: boolean;
  clustering_order?: 'ASC' | 'DESC';
  nullable?: boolean;
}

export interface IndexInfo {
  name: string;
  column: string;
  type?: string;
}

export interface SchemaInfo {
  columns?: ColumnInfo[];
  indexes?: IndexInfo[];
  fields?: Array<{ name: string; type: string }>; // For schemaless DBs
}

export interface QueryInput {
  query: string;
  pageSize?: number;
  pageState?: string;
  parameters?: any[];
}

export interface QueryResult {
  success: boolean;
  results: any[];
  columns?: Array<{ name: string; type: string }>;
  pageState?: string;
  executionTime: number;
  rowCount: number;
  error?: string;
}

export interface SystemInfo {
  version: string;
  cluster_name?: string;
  nodes_count?: number;
  [key: string]: any;
}

/**
 * Main Database Adapter Interface
 */
export interface DatabaseAdapter {
  // Metadata
  readonly type: DatabaseType;
  readonly displayName: string;
  readonly icon: string;
  readonly capabilities: DatabaseCapabilities;
  
  // Connection Management
  connect(config: ConnectionConfig): Promise<ConnectionResult>;
  disconnect(connectionId: string): Promise<void>;
  testConnection(config: ConnectionConfig): Promise<TestResult>;
  
  // Schema Operations
  listDatabases(connectionId: string): Promise<DatabaseInfo[]>;
  listCollections(connectionId: string, database: string): Promise<CollectionInfo[]>;
  getSchema(connectionId: string, database: string, collection: string): Promise<SchemaInfo>;
  
  // Query Operations
  executeQuery(connectionId: string, query: QueryInput): Promise<QueryResult>;
  getQueryLanguage(): QueryLanguage;
  
  // System Information
  getSystemInfo(connectionId: string): Promise<SystemInfo>;
  
  // Optional: Advanced Features
  supportsIndexes?(): boolean;
  listIndexes?(connectionId: string, database: string, collection: string): Promise<IndexInfo[]>;
  
  supportsAggregation?(): boolean;
  executeAggregation?(connectionId: string, pipeline: any): Promise<QueryResult>;
}
