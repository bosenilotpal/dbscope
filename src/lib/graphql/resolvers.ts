import { GraphQLScalarType, Kind } from 'graphql';
import { adapterRegistry } from '../adapters/registry';
import prisma from '../db/connection';
import { DatabaseType } from '../adapters/base/adapter.interface';

// JSON scalar type for flexible data
const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: any) {
    return value;
  },
  parseValue(value: any) {
    return value;
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value);
      case Kind.OBJECT:
        throw new Error('Object literals not implemented');
      default:
        return null;
    }
  },
});

// Store active connections with their database types
const activeConnections = new Map<string, { databaseType: DatabaseType }>();

export const resolvers = {
  JSON: JSONScalar,

  Query: {
    health: () => ({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'DBscope GraphQL API'
    }),

    supportedDatabases: () => {
      return adapterRegistry.getSupportedDatabases();
    },

    testConnection: async (_: any, { type, input }: any) => {
      const normalizedType = type.toLowerCase() as DatabaseType;
      const adapter = adapterRegistry.get(normalizedType);
      return adapter.testConnection(input);
    },

    listDatabases: async (_: any, { connectionId }: any) => {
      const connectionInfo = activeConnections.get(connectionId);
      if (!connectionInfo) {
        throw new Error('Connection not found. Please connect first.');
      }

      const adapter = adapterRegistry.get(connectionInfo.databaseType);
      return adapter.listDatabases(connectionId);
    },

    listCollections: async (_: any, { connectionId, database }: any) => {
      const connectionInfo = activeConnections.get(connectionId);
      if (!connectionInfo) {
        throw new Error('Connection not found. Please connect first.');
      }

      const adapter = adapterRegistry.get(connectionInfo.databaseType);
      return adapter.listCollections(connectionId, database);
    },

    getSchema: async (_: any, { connectionId, database, collection }: any) => {
      const connectionInfo = activeConnections.get(connectionId);
      if (!connectionInfo) {
        throw new Error('Connection not found. Please connect first.');
      }

      const adapter = adapterRegistry.get(connectionInfo.databaseType);
      return adapter.getSchema(connectionId, database, collection);
    },

    executeQuery: async (_: any, { connectionId, input }: any) => {
      const connectionInfo = activeConnections.get(connectionId);
      if (!connectionInfo) {
        throw new Error('Connection not found. Please connect first.');
      }

      const adapter = adapterRegistry.get(connectionInfo.databaseType);
      return adapter.executeQuery(connectionId, input);
    },

    getSystemInfo: async (_: any, { connectionId }: any) => {
      const connectionInfo = activeConnections.get(connectionId);
      if (!connectionInfo) {
        throw new Error('Connection not found. Please connect first.');
      }

      const adapter = adapterRegistry.get(connectionInfo.databaseType);
      return adapter.getSystemInfo(connectionId);
    },

    getQueryHistory: async (_: any, { connectionId }: any) => {
      const history = await prisma.queryHistory.findMany({
        where: { connectionId },
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      return history.map(item => ({
        id: item.id,
        query: item.query,
        queryLanguage: item.queryLanguage,
        status: item.status,
        executionTime: item.executionTime,
        rowCount: item.rowCount,
        error: item.error,
        createdAt: item.createdAt.toISOString()
      }));
    }
  },

  Mutation: {
    connect: async (_: any, { type, input }: any) => {
      // Normalize type to lowercase (GraphQL enum comes as uppercase CASSANDRA, but enum value is 'cassandra')
      const normalizedType =type.toLowerCase() as DatabaseType;
      const adapter = adapterRegistry.get(normalizedType);
      const result = await adapter.connect(input);

      // Store connection info for future queries
      activeConnections.set(result.connectionId, { databaseType: normalizedType });

      return result;
    },

    disconnect: async (_: any, { connectionId }: any) => {
      const connectionInfo = activeConnections.get(connectionId);
      if (!connectionInfo) {
        return {
          success: false,
          message: 'Connection not found'
        };
      }

      const adapter = adapterRegistry.get(connectionInfo.databaseType);
      await adapter.disconnect(connectionId);

      // Remove from active connections
      activeConnections.delete(connectionId);

      return {
        success: true,
        message: 'Successfully disconnected'
      };
    }
  }
};
