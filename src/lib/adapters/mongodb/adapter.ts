import { MongoClient, Db, Document, type ListDatabasesResult, type IndexDescription, type Sort } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { transactionLog, queryHistory } from '@/lib/db/sqlite';
import {
  DatabaseAdapter,
  DatabaseType,
  DatabaseCapabilities,
  QueryLanguage,
  SchemaType,
  ConnectionConfig,
  ConnectionResult,
  TestResult,
  DatabaseInfo,
  CollectionInfo,
  SchemaInfo,
  QueryInput,
  QueryResult,
  SystemInfo,
  IndexInfo
} from '../base/adapter.interface';

interface MongoConnectionInfo {
  connectionId: string;
  client: MongoClient;
  config: ConnectionConfig;
  createdAt: Date;
  lastUsed: Date;
}

export class MongoDBAdapter implements DatabaseAdapter {
  // Metadata
  readonly type = DatabaseType.MONGODB;
  readonly displayName = 'MongoDB';
  // Simple emoji icon for now; can be replaced with SVG later
  readonly icon = '🍃';
  readonly capabilities: DatabaseCapabilities = {
    supportsKeyspaces: false,
    supportsIndexes: true,
    supportsAggregation: true,
    supportsTransactions: true,
    queryLanguage: QueryLanguage.MQL,
    schemaType: SchemaType.SCHEMA_OPTIONAL
  };

  private connections: Map<string, MongoConnectionInfo> = new Map();

  // Connection Management
  async connect(config: ConnectionConfig): Promise<ConnectionResult> {
    const startTime = Date.now();

    try {
      const uri = this.buildMongoUri(config);
      const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000
      });

      await client.connect();
      // Trigger a simple command to verify connectivity
      await client.db(config.database || 'admin').command({ ping: 1 });

      const connectionId = uuidv4();
      const connectionInfo: MongoConnectionInfo = {
        connectionId,
        client,
        config,
        createdAt: new Date(),
        lastUsed: new Date()
      };

      this.connections.set(connectionId, connectionInfo);

      try {
        transactionLog.create({
          connectionId,
          databaseType: this.type,
          operation: 'CONNECT',
          details: JSON.stringify({
            host: config.host,
            port: config.port,
            database: config.database
          })
        });
      } catch (err) {
        console.error('Failed to log MongoDB connection:', err);
      }

      return {
        connectionId,
        status: 'connected',
        message: 'Successfully connected to MongoDB',
        execution_time: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown MongoDB connection error';
      throw new Error(`Failed to connect to MongoDB: ${errorMessage}`);
    }
  }

  async disconnect(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    await connection.client.close();
    this.connections.delete(connectionId);

    try {
      transactionLog.create({
        connectionId,
        databaseType: this.type,
        operation: 'DISCONNECT'
      });
    } catch (err) {
      console.error('Failed to log MongoDB disconnection:', err);
    }
  }

  async testConnection(config: ConnectionConfig): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const { connectionId } = await this.connect(config);
      await this.disconnect(connectionId);

      return {
        success: true,
        status: 'success',
        message: 'MongoDB connection test successful',
        execution_time: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown MongoDB connection error';
      return {
        success: false,
        status: 'failed',
        message: errorMessage,
        execution_time: Date.now() - startTime
      };
    }
  }

  // Schema Operations
  async listDatabases(connectionId: string): Promise<DatabaseInfo[]> {
    const connection = this.getConnection(connectionId);

    const adminDb = connection.client.db('admin');
    const result: ListDatabasesResult = await adminDb.admin().listDatabases();

    return result.databases.map(databaseInfo => ({
      name: databaseInfo.name,
      collections_count: undefined,
      size: typeof databaseInfo.sizeOnDisk === 'number' ? `${databaseInfo.sizeOnDisk} bytes` : undefined
    }));
  }

  async listCollections(connectionId: string, database: string): Promise<CollectionInfo[]> {
    const connection = this.getConnection(connectionId);
    const db: Db = connection.client.db(database);

    const collections = await db.listCollections().toArray();

    const results: CollectionInfo[] = [];

    for (const col of collections) {
      let documentsCount: number | undefined;
      try {
        const count = await db.collection(col.name).countDocuments();
        documentsCount = count;
      } catch (err) {
        console.warn(`Failed to get document count for collection ${database}.${col.name}:`, err);
      }

      results.push({
        name: col.name,
        type: col.type,
        documents_count: documentsCount,
        columns_count: undefined
      });
    }

    return results;
  }

  async getSchema(connectionId: string, database: string, collection: string): Promise<SchemaInfo> {
    const connection = this.getConnection(connectionId);
    const db: Db = connection.client.db(database);

    const fieldsMap = new Map<string, string>();

    try {
      const sampleDocs = await db.collection(collection).find({}).limit(50).toArray();

      for (const doc of sampleDocs) {
        this.extractFieldsFromDocument(doc, fieldsMap, '');
      }
    } catch (err) {
      console.warn(`Failed to infer schema for collection ${database}.${collection}:`, err);
    }

    const fields = Array.from(fieldsMap.entries()).map(([name, type]) => ({
      name,
      type
    }));

    let indexes: IndexInfo[] = [];
    try {
      const indexInfo: IndexDescription[] = await db.collection(collection).indexes();
      indexes = indexInfo.map((idx) => {
        const keyField = idx.key ? Object.keys(idx.key)[0] : 'unknown';
        return {
          name: idx.name || keyField,
          column: keyField,
          type: idx.unique ? 'unique' : 'regular'
        };
      });
    } catch (err) {
      console.warn(`Failed to list indexes for collection ${database}.${collection}:`, err);
    }

    return {
      columns: undefined,
      indexes,
      fields
    };
  }

  // Query Operations
  async executeQuery(connectionId: string, input: QueryInput): Promise<QueryResult> {
    const connection = this.getConnection(connectionId);
    const startTime = Date.now();

    try {
      const parsed = this.parseQueryInput(input.query);
      const db = connection.client.db(parsed.database || connection.config.database || 'test');
      const collection = db.collection(parsed.collection);

      const pageSize = input.pageSize || 100;
      const skip = input.pageState ? parseInt(input.pageState, 10) || 0 : 0;

      let cursor = collection.find(parsed.filter).skip(skip).limit(pageSize);

      if (parsed.projection) {
        cursor = cursor.project(parsed.projection);
      }

      if (parsed.sort) {
        cursor = cursor.sort(parsed.sort);
      }

      const docs = (await cursor.toArray()) as Document[];

      const nextPageState = docs.length === pageSize ? String(skip + pageSize) : undefined;
      const executionTime = Date.now() - startTime;

      const columns = this.inferColumnsFromDocuments(docs);

      const result: QueryResult = {
        success: true,
        results: docs,
        columns,
        pageState: nextPageState,
        executionTime,
        rowCount: docs.length
      };

      try {
        queryHistory.create({
          connectionId,
          databaseType: this.type,
          queryLanguage: this.getQueryLanguage(),
          query: input.query,
          status: 'success',
          executionTime,
          rowCount: result.rowCount
        });
      } catch (err) {
        console.error('Failed to save MongoDB query history:', err);
      }

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown MongoDB query error';

      try {
        queryHistory.create({
          connectionId,
          databaseType: this.type,
          queryLanguage: this.getQueryLanguage(),
          query: input.query,
          status: 'error',
          executionTime,
          error: errorMessage
        });
      } catch (err) {
        console.error('Failed to save MongoDB query error history:', err);
      }

      return {
        success: false,
        results: [],
        executionTime,
        rowCount: 0,
        error: errorMessage
      };
    }
  }

  getQueryLanguage(): QueryLanguage {
    return QueryLanguage.MQL;
  }

  async getSystemInfo(connectionId: string): Promise<SystemInfo> {
    const connection = this.getConnection(connectionId);
    const adminDb = connection.client.db('admin');

    const buildInfo = await adminDb.command({ buildInfo: 1 });
    const serverStatus = await adminDb.command({ serverStatus: 1 });

    return {
      version: buildInfo.version || 'unknown',
      cluster_name: serverStatus.repl ? serverStatus.repl.setName : undefined,
      nodes_count: serverStatus.connections ? serverStatus.connections.current : undefined
    };
  }

  supportsIndexes(): boolean {
    return true;
  }

  supportsAggregation(): boolean {
    return true;
  }

  async executeAggregation(connectionId: string, pipeline: unknown): Promise<QueryResult> {
    const connection = this.getConnection(connectionId);
    const startTime = Date.now();

    try {
      type AggregationRequest = {
        database?: string;
        collection: string;
        pipeline: Document[];
      };

      const { database, collection, pipeline: aggPipeline } = pipeline as AggregationRequest;

      const db = connection.client.db(database || connection.config.database || 'test');
      const col = db.collection(collection);

      const docs = await col.aggregate(aggPipeline).toArray();
      const executionTime = Date.now() - startTime;
      const columns = this.inferColumnsFromDocuments(docs);

      return {
        success: true,
        results: docs,
        columns,
        executionTime,
        rowCount: docs.length
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown MongoDB aggregation error';

      return {
        success: false,
        results: [],
        executionTime,
        rowCount: 0,
        error: errorMessage
      };
    }
  }

  // Private helpers
  private getConnection(connectionId: string): MongoConnectionInfo {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error('Connection not found or expired');
    }
    connection.lastUsed = new Date();
    return connection;
  }

  private buildMongoUri(config: ConnectionConfig): string {
    if (config.uri) {
      return config.uri;
    }

    const host = config.host || 'localhost';
    const port = config.port || 27017;

    let credentials = '';
    if (config.username && config.password) {
      const user = encodeURIComponent(config.username);
      const pass = encodeURIComponent(config.password);
      credentials = `${user}:${pass}@`;
    }

    const dbName = config.database || '';
    const dbPath = dbName ? `/${dbName}` : '';

    return `mongodb://${credentials}${host}:${port}${dbPath}`;
  }

  /**
   * Parse the incoming query string into a MongoDB-friendly shape.
   *
   * Supported formats:
   * 1) JSON object:
   *    {
   *      "database": "mydb",
   *      "collection": "users",
   *      "filter": { "active": true },
   *      "projection": { "name": 1 },
   *      "sort": { "createdAt": -1 }
   *    }
   *
   * 2) Simple SQL-like selector (used by the UI when clicking collections):
   *    SELECT * FROM mydb.users LIMIT 100;
   */
  private parseQueryInput(query: string): {
    database?: string;
    collection: string;
    filter: Document;
    projection?: Document;
    sort?: Sort;
  } {
    const trimmed = query.trim();

    // Try JSON first
    if (trimmed.startsWith('{')) {
      try {
        const obj = JSON.parse(trimmed) as {
          database?: string;
          collection?: string;
          filter?: Document;
          projection?: Document;
          sort?: Sort;
        };

        if (!obj.collection) {
          throw new Error('MongoDB JSON query must include a "collection" field.');
        }

        return {
          database: obj.database,
          collection: obj.collection,
          filter: obj.filter || {},
          projection: obj.projection,
          sort: obj.sort,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid JSON';
        throw new Error(`Failed to parse MongoDB JSON query: ${message}`);
      }
    }

    // Support simple SELECT * FROM db.collection LIMIT N; pattern
    const selectMatch = trimmed.match(/select\s+\*\s+from\s+([^\s;]+)(?:\s+limit\s+\d+)?/i);
    if (selectMatch) {
      const fullName = selectMatch[1];
      let database: string | undefined;
      let collection = fullName;

      if (fullName.includes('.')) {
        const parts = fullName.split('.');
        database = parts[0];
        collection = parts.slice(1).join('.');
      }

      return {
        database,
        collection,
        filter: {}
      };
    }

    throw new Error(
      'Unsupported MongoDB query format. Use either a JSON query object or a simple "SELECT * FROM database.collection LIMIT N" style query.'
    );
  }

  private extractFieldsFromDocument(doc: Document, fieldsMap: Map<string, string>, prefix: string) {
    for (const [key, value] of Object.entries(doc)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (value === null || value === undefined) {
        if (!fieldsMap.has(path)) {
          fieldsMap.set(path, 'unknown');
        }
      } else if (Array.isArray(value)) {
        if (!fieldsMap.has(path)) {
          fieldsMap.set(path, 'array');
        }
      } else if (typeof value === 'object') {
        fieldsMap.set(path, 'object');
        this.extractFieldsFromDocument(value as Document, fieldsMap, path);
      } else {
        const type = typeof value;
        if (!fieldsMap.has(path)) {
          fieldsMap.set(path, type);
        }
      }
    }
  }

  private inferColumnsFromDocuments(docs: Document[]): Array<{ name: string; type: string }> {
    const fieldsMap = new Map<string, string>();
    for (const doc of docs) {
      this.extractFieldsFromDocument(doc, fieldsMap, '');
    }

    return Array.from(fieldsMap.entries()).map(([name, type]) => ({
      name,
      type
    }));
  }
}

