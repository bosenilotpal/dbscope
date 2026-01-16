
# Database Integration Roadmap: CouchDB & AWS DocumentDB/DynamoDB

This document outlines the technical plan for extending the `dbscope` viewer to support CouchDB, AWS DocumentDB, and AWS DynamoDB.

## 1. Prerequisites & Dependencies

We will rely on the official drivers for stability and support.

| Database | Driver / Library | Version | Notes |
| :--- | :--- | :--- | :--- |
| **AWS DocumentDB** | `mongodb` | `^6.3.0` | Compatible with MongoDB 3.6/4.0/5.0 APIs. |
| **AWS DynamoDB** | `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb` | `^3.x` | Use `lib-dynamodb` for easier JSON marshaling. |
| **CouchDB** | `nano` | `^10.1.3` | Lightweight, standard CouchDB client. |

## 2. Interface Extensions

We need to update `src/lib/adapters/base/adapter.interface.ts` to support these new types.

### Generic Enums
```typescript
export enum DatabaseType {
  // ... existing types
  COUCHDB = 'couchdb',
  // AWS DocumentDB is essentially MongoDB, so we might reuse MONGODB or add DOCUMENTDB alias
}

export enum QueryLanguage {
  // ... existing types
  MANGO = 'mango',       // CouchDB Mango queries
  PARTIQL = 'partiql'    // DynamoDB PartiQL
}
```

## 3. Adapter Implementation Strategy

### A. MongoDB / AWS DocumentDB
Since AWS DocumentDB is MongoDB-compatible, we can build a single robust `MongoDBAdapter`.

**Location**: `src/lib/adapters/mongodb/adapter.ts`

*   **Connection**: Use `MongoClient` from `mongodb` package.
*   **Listing Databases**: `client.db().admin().listDatabases()`
*   **Listing Collections**: `db.listCollections()`
*   **Schema**:
    *   Since it's schemaless, efficient schema sampling is needed.
    *   We will fetch 1-5 documents to infer the "approximate" schema (keys and types).
*   **Querying**:
    *   Input: JSON string representing a MongoDB filter (e.g., `{"age": {"$gt": 18}}`).
    *   Execution: `collection.find(parsedQuery).limit(limit)`.

### B. AWS DynamoDB
DynamoDB's flat hierarchy requires a slightly different approach mapping to our "Database -> Collection" generic model.

**Location**: `src/lib/adapters/dynamodb/adapter.ts`

*   **Mapping**:
    *   **Database**: AWS Region (e.g., `us-east-1`) OR valid specific Table prefix if using single-table design (less likely for a general viewer). We will likely treat the "Region" as the container, or just have one "Default" database containing all tables in that region.
    *   **Collection**: DynamoDB Table.
*   **Connection**: `DynamoDBClient` with AWS Credentials.
*   **Listing Collections**: `ListTablesCommand`.
*   **Schema**:
    *   DynamoDB tables have a primary key schema (Partition Key + Sort Key).
    *   Attributes are schemaless. We will sample items via `Scan` (limit 1) or `Query` to infer other attributes.
*   **Querying**:
    *   We will support **PartiQL** (`ExecuteStatementCommand`) as it maps cleanest to a SQL-like interface: `SELECT * FROM "MyTable" WHERE ...`

### C. CouchDB
CouchDB uses a hierarchy of Databases -> Documents. It does not strictly have "Collections" in the MongoDB sense, although some patterns use a `type` field.

**Location**: `src/lib/adapters/couchdb/adapter.ts`

*   **Mapping**:
    *   **Database**: CouchDB Database.
    *   **Collection**: We will likely expose a single virtual collection named `_all_docs` or `documents` for each DB.
*   **Connection**: `nano(url)`.
*   **Listing Databases**: `nano.db.list()`.
*   **Schema**: Strictly schemaless. We rely on sampling.
*   **Querying**:
    *   **Mango Queries**: The standard JSON-based query language (`_find`).
    *   Input: JSON object selector.

## 4. Integration Steps

1.  **Install Dependencies**: `npm install mongodb @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb nano`
2.  **Define Interfaces**: Update `adapter.interface.ts`.
3.  **Implement Adapters**: Create adapter classes in `src/lib/adapters/`.
4.  **Register Adapters**: Import and instantiate them in `src/lib/adapters/registry.ts`.
5.  **Environment Variables**: Update `.env.local` templates to include connection strings/secrets for these new DBs.
