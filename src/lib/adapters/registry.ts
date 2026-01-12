import { DatabaseAdapter, DatabaseType } from './base/adapter.interface';

/**
 * Adapter Registry
 * 
 * Centralized registry for all database adapters.
 * New adapters are registered here to make them available throughout the app.
 */
class AdapterRegistry {
  private adapters = new Map<DatabaseType, DatabaseAdapter>();
  
  /**
   * Register a database adapter
   */
  register(adapter: DatabaseAdapter): void {
    if (this.adapters.has(adapter.type)) {
      console.warn(`Adapter for ${adapter.type} is already registered. Overwriting.`);
    }
    this.adapters.set(adapter.type, adapter);
    console.log(`✅ Registered adapter: ${adapter.displayName} (${adapter.type})`);
  }
  
  /**
   * Get an adapter by database type
   */
  get(type: DatabaseType): DatabaseAdapter {
    const adapter = this.adapters.get(type);
    if (!adapter) {
      throw new Error(`Database adapter for ${type} not found. Available: ${this.getAvailableTypes().join(', ')}`);
    }
    return adapter;
  }
  
  /**
   * Get all registered adapters
   */
  list(): DatabaseAdapter[] {
    return Array.from(this.adapters.values());
  }
  
  /**
   * Check if an adapter is registered
   */
  has(type: DatabaseType): boolean {
    return this.adapters.has(type);
  }
  
  /**
   * Get available database types
   */
  getAvailableTypes(): DatabaseType[] {
    return Array.from(this.adapters.keys());
  }
  
  /**
   * Get supported databases with metadata
   */
  getSupportedDatabases(): Array<{
    type: DatabaseType;
    displayName: string;
    icon: string;
    capabilities: any;
  }> {
    return this.list().map(adapter => ({
      type: adapter.type,
      displayName: adapter.displayName,
      icon: adapter.icon,
      capabilities: adapter.capabilities
    }));
  }
}

// Export singleton instance
export const adapterRegistry = new AdapterRegistry();

// Auto-register adapters on import
import { CassandraAdapter } from './cassandra/adapter';

// Register available adapters
adapterRegistry.register(new CassandraAdapter());

// Future: Add more adapters as they're implemented
// adapterRegistry.register(new MongoDBAdapter());
// adapterRegistry.register(new DynamoDBAdapter());
