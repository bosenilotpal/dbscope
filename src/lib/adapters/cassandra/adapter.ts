import { Client, types, auth } from 'cassandra-driver';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/db/connection';
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
  SystemInfo
} from '../base/adapter.interface';

interface ConnectionInfo {
  connectionId: string;
  client: Client;
  config: ConnectionConfig;
  createdAt: Date;
  lastUsed: Date;
}

export class CassandraAdapter implements DatabaseAdapter {
  // Metadata
  readonly type = DatabaseType.CASSANDRA;
  readonly displayName = 'Apache Cassandra';
  readonly icon = '🗂️';
  readonly capabilities: DatabaseCapabilities = {
    supportsKeyspaces: true,
    supportsIndexes: true,
    supportsAggregation: false,
    supportsTransactions: false,
    queryLanguage: QueryLanguage.CQL,
    schemaType: SchemaType.SCHEMA_REQUIRED
  };

  private connections: Map<string, ConnectionInfo> = new Map();

  // Connection Management
  async connect(config: ConnectionConfig): Promise<ConnectionResult> {
    const startTime = Date.now();
    
    try {
      const contactPoints = [`${config.host}:${config.port}`];
      const clientOptions: any = {
        contactPoints,
        localDataCenter: config.localDataCenter || 'datacenter1',
        socketOptions: {
          connectTimeout: 10000,
          readTimeout: 10000,
        },
      };

      if (config.username && config.password) {
        clientOptions.authProvider = new auth.PlainTextAuthProvider(
          config.username,
          config.password
        );
      }

      if (config.keyspace) {
        clientOptions.keyspace = config.keyspace;
      }

      const client = new Client(clientOptions);
      await client.connect();

      const connectionId = uuidv4();
      const connectionInfo: ConnectionInfo = {
        connectionId,
        client,
        config,
        createdAt: new Date(),
        lastUsed: new Date(),
      };

      this.connections.set(connectionId, connectionInfo);

      // Log connection in SQLite
      await prisma.transactionLog.create({
        data: {
          connectionId,
          databaseType: this.type,
          operation: 'CONNECT',
          details: JSON.stringify({ host: config.host, port: config.port, keyspace: config.keyspace })
        }
      }).catch(err => console.error('Failed to log connection:', err));

      return {
        connectionId,
        status: 'connected',
        message: 'Successfully connected to Cassandra database',
        execution_time: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      throw new Error(`Failed to connect to Cassandra: ${errorMessage}`);
    }
  }

  async disconnect(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    await connection.client.shutdown();
    this.connections.delete(connectionId);

    // Log disconnection
    await prisma.transactionLog.create({
      data: {
        connectionId,
        databaseType: this.type,
        operation: 'DISCONNECT'
      }
    }).catch(err => console.error('Failed to log disconnection:', err));
  }

  async testConnection(config: ConnectionConfig): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const { connectionId } = await this.connect(config);
      await this.disconnect(connectionId);
      
      return {
        success: true,
        status: 'success',
        message: 'Connection test successful',
        execution_time: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
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
    
    try {
      const query = `SELECT keyspace_name FROM system_schema.keyspaces`;
      const result = await connection.client.execute(query);

      const systemKeyspaces = ['system', 'system_auth', 'system_distributed', 'system_schema', 'system_traces'];
      const keyspaces: DatabaseInfo[] = [];

      for (const row of result.rows) {
        const keyspaceName = row.keyspace_name;
        
        if (systemKeyspaces.includes(keyspaceName)) {
          continue;
        }

        try {
          const tableCountQuery = `SELECT table_name FROM system_schema.tables WHERE keyspace_name = ?`;
          const tableCountResult = await connection.client.execute(tableCountQuery, [keyspaceName]);

          keyspaces.push({
            name: keyspaceName,
            collections_count: tableCountResult.rows.length
          });
        } catch (error) {
          console.warn(`Could not get table count for keyspace ${keyspaceName}:`, error);
          keyspaces.push({
            name: keyspaceName,
            collections_count: 0
          });
        }
      }

      return keyspaces;
    } catch (error) {
      console.error('Failed to get keyspaces:', error);
      throw new Error(`Failed to list databases: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listCollections(connectionId: string, database: string): Promise<CollectionInfo[]> {
    const connection = this.getConnection(connectionId);
    const query = `SELECT table_name FROM system_schema.tables WHERE keyspace_name = ?`;

    const result = await connection.client.execute(query, [database]);
    const tables: CollectionInfo[] = [];

    for (const row of result.rows) {
      const tableName = row.table_name;

      try {
        const columnCountQuery = `SELECT column_name FROM system_schema.columns WHERE keyspace_name = ? AND table_name = ?`;
        const columnCountResult = await connection.client.execute(columnCountQuery, [database, tableName]);

        tables.push({
          name: tableName,
          columns_count: columnCountResult.rows.length
        });
      } catch (error) {
        console.warn(`Could not get column count for table ${database}.${tableName}:`, error);
        tables.push({
          name: tableName,
          columns_count: 0
        });
      }
    }

    return tables;
  }

  async getSchema(connectionId: string, database: string, collection: string): Promise<SchemaInfo> {
    const connection = this.getConnection(connectionId);

    try {
      const columnsQuery = `
        SELECT column_name, type, kind, position, clustering_order 
        FROM system_schema.columns 
        WHERE keyspace_name = ? AND table_name = ?
      `;
      const columnsResult = await connection.client.execute(columnsQuery, [database, collection]);

      const columns = columnsResult.rows.map(row => ({
        name: row.column_name,
        type: row.type || 'unknown',
        primary_key: row.kind === 'partition_key' || row.kind === 'clustering',
        clustering_order: row.kind === 'clustering' ? (row.clustering_order || 'ASC') as 'ASC' | 'DESC' : undefined
      }));

      let indexes: Array<{ name: string; column: string }> = [];
      try {
        const indexesQuery = `
          SELECT index_name, options 
          FROM system_schema.indexes 
          WHERE keyspace_name = ? AND table_name = ?
        `;
        const indexesResult = await connection.client.execute(indexesQuery, [database, collection]);

        indexes = indexesResult.rows.map(row => {
          let targetColumn = 'unknown';
          if (row.options && typeof row.options === 'object' && row.options.target) {
            targetColumn = row.options.target.toString().replace(/["']/g, '');
          }

          return {
            name: row.index_name,
            column: targetColumn
          };
        }).filter(idx => idx.name);
      } catch (indexError) {
        console.warn(`Could not get indexes for table ${database}.${collection}:`, indexError);
      }

      return { columns, indexes };
    } catch (error) {
      console.error(`Error getting schema for ${database}.${collection}:`, error);
      throw new Error(`Failed to get schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Query Operations
  async executeQuery(connectionId: string, input: QueryInput): Promise<QueryResult> {
    const connection = this.getConnection(connectionId);
    const startTime = Date.now();

    try {
      const trimmedQuery = input.query.trim().toLowerCase();
      if (!trimmedQuery.startsWith('select')) {
        throw new Error('Only SELECT queries are allowed');
      }

      const options: any = {
        fetchSize: input.pageSize || 100,
      };

      if (input.pageState) {
        options.pageState = input.pageState;
      }

      const result = await connection.client.execute(input.query, input.parameters || [], options);
      const executionTime = Date.now() - startTime;

      const columns = result.columns?.map((col: any) => ({
        name: col.name,
        type: this.getColumnTypeName(col.type)
      })) || [];

      const queryResult: QueryResult = {
        success: true,
        results: result.rows.map(row => row),
        columns,
        pageState: result.pageState,
        executionTime,
        rowCount: result.rowLength || 0
      };

      // Save to query history in SQLite
      await prisma.queryHistory.create({
        data: {
          connectionId,
          databaseType: this.type,
          queryLanguage: this.getQueryLanguage(),
          query: input.query,
          status: 'success',
          executionTime,
          rowCount: queryResult.rowCount
        }
      }).catch(err => console.error('Failed to save query history:', err));

      return queryResult;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown query error';

      // Save error to query history
      await prisma.queryHistory.create({
        data: {
          connectionId,
          databaseType: this.type,
          queryLanguage: this.getQueryLanguage(),
          query: input.query,
          status: 'error',
          executionTime,
          error: errorMessage
        }
      }).catch(err => console.error('Failed to save query history:', err));

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
    return QueryLanguage.CQL;
  }

  async getSystemInfo(connectionId: string): Promise<SystemInfo> {
    const connection = this.getConnection(connectionId);

    const systemQuery = `SELECT cluster_name, release_version FROM system.local`;
    const systemResult = await connection.client.execute(systemQuery);
    const systemRow = systemResult.rows[0];

    const nodesQuery = `SELECT COUNT(*) as node_count FROM system.peers`;
    const nodesResult = await connection.client.execute(nodesQuery);
    const nodeCount = parseInt(nodesResult.rows[0].node_count) + 1; // +1 for local node

    return {
      version: systemRow.release_version,
      cluster_name: systemRow.cluster_name,
      nodes_count: nodeCount
    };
  }

  // Optional methods
  supportsIndexes(): boolean {
    return true;
  }

  // Private helper methods
  private getConnection(connectionId: string): ConnectionInfo {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error('Connection not found or expired');
    }
    connection.lastUsed = new Date();
    return connection;
  }

  private getColumnTypeName(columnType: any): string {
    if (!columnType) return 'unknown';

    const typeMap: { [key: number]: string } = {
      1: 'ascii', 2: 'bigint', 3: 'blob', 4: 'boolean', 5: 'counter',
      6: 'decimal', 7: 'double', 8: 'float', 9: 'int', 10: 'text',
      11: 'timestamp', 12: 'uuid', 13: 'varchar', 14: 'varint', 15: 'timeuuid',
      16: 'inet', 17: 'date', 18: 'time', 19: 'smallint', 20: 'tinyint',
      21: 'duration', 32: 'list', 33: 'map', 34: 'set', 48: 'udt', 49: 'tuple'
    };

    if (columnType.code !== undefined && typeMap[columnType.code]) {
      let typeName = typeMap[columnType.code];

      if (columnType.code === 32 && columnType.info) {
        const elementType = this.getColumnTypeName(columnType.info);
        typeName = `list<${elementType}>`;
      } else if (columnType.code === 33 && columnType.info) {
        const keyType = this.getColumnTypeName(columnType.info[0]);
        const valueType = this.getColumnTypeName(columnType.info[1]);
        typeName = `map<${keyType}, ${valueType}>`;
      } else if (columnType.code === 34 && columnType.info) {
        const elementType = this.getColumnTypeName(columnType.info);
        typeName = `set<${elementType}>`;
      }

      return typeName;
    }

    if (columnType.name) {
      return columnType.name;
    }

    return 'unknown';
  }
}
