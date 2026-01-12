export const typeDefs = `#graphql
  scalar JSON

  type Query {
    # Health & Configuration
    health: HealthStatus!
    supportedDatabases: [DatabaseSupport!]!
    
    # Connection Testing
    testConnection(type: DatabaseType!, input: ConnectionInput!): ConnectionTestResult!
    
    # Schema Operations
    listDatabases(connectionId: ID!): [DatabaseInfo!]!
    listCollections(connectionId: ID!, database: String!): [CollectionInfo!]!
    getSchema(connectionId: ID!, database: String!, collection: String!): SchemaInfo!
    
    # Query Execution
    executeQuery(connectionId: ID!, input: QueryInput!): QueryResult!
    
    # System Information
    getSystemInfo(connectionId: ID!): SystemInfo!
    
    # History & Saved Queries
    getQueryHistory(connectionId: ID!): [QueryHistoryItem!]!
  }

  type Mutation {
    # Connection Management
    connect(type: DatabaseType!, input: ConnectionInput!): ConnectionResult!
    disconnect(connectionId: ID!): DisconnectionResult!
  }

  # Enums
  enum DatabaseType {
    CASSANDRA
    SCYLLADB
    MONGODB
    DYNAMODB
    REDIS
    COUCHBASE
  }

  # Input Types
  input ConnectionInput {
    host: String
    port: Int
    uri: String
    username: String
    password: String
    keyspace: String
    database: String
    region: String
    localDataCenter: String
  }

  input QueryInput {
    query: String!
    pageSize: Int
    pageState: String
    parameters: [JSON]
  }

  # Object Types
  type HealthStatus {
    status: String!
    timestamp: String!
    uptime: Float!
    service: String!
  }

  type DatabaseSupport {
    type: DatabaseType!
    displayName: String!
    icon: String!
    capabilities: DatabaseCapabilities!
  }

  type DatabaseCapabilities {
    supportsKeyspaces: Boolean!
    supportsIndexes: Boolean!
    supportsAggregation: Boolean!
    supportsTransactions: Boolean!
    queryLanguage: String!
    schemaType: String!
  }

  type ConnectionTestResult {
    success: Boolean!
    status: String!
    message: String!
    execution_time: Int!
  }

  type ConnectionResult {
    connectionId: ID!
    status: String!
    message: String!
    execution_time: Int
  }

  type DisconnectionResult {
    success: Boolean!
    message: String!
  }

  type DatabaseInfo {
    name: String!
    collections_count: Int
    size: String
  }

  type CollectionInfo {
    name: String!
    type: String
    documents_count: Int
    columns_count: Int
  }

  type ColumnInfo {
    name: String!
    type: String!
    primary_key: Boolean
    clustering_order: String
    nullable: Boolean
  }

  type IndexInfo {
    name: String!
    column: String!
    type: String
  }

  type SchemaInfo {
    columns: [ColumnInfo!]
    indexes: [IndexInfo!]
    fields: [FieldInfo!]
  }

  type FieldInfo {
    name: String!
    type: String!
  }

  type QueryResult {
    success: Boolean!
    results: [JSON!]!
    columns: [ColumnDefinition!]
    pageState: String
    executionTime: Int!
    rowCount: Int!
    error: String
  }

  type ColumnDefinition {
    name: String!
    type: String!
  }

  type SystemInfo {
    version: String!
    cluster_name: String
    nodes_count: Int
  }

  type QueryHistoryItem {
    id: ID!
    query: String!
    queryLanguage: String!
    status: String!
    executionTime: Int!
    rowCount: Int
    error: String
    createdAt: String!
  }
`;
