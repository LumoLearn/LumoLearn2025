import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PostgreSQL Database Configuration
 *
 * Manages connection pool to PostgreSQL for lesson metadata storage
 * Uses the same database as auth service
 */

interface PostgresConfig {
  connectionString: string;
  maxPoolSize: number;
  idleTimeoutMs: number;
  connectionTimeoutMs: number;
}

class PostgresDatabase {
  private static instance: PostgresDatabase;
  private pool: Pool | null = null;
  private config: PostgresConfig;

  private constructor() {
    this.config = {
      connectionString: process.env.DATABASE_URL || 'postgresql://lumolearn:dev_pass@localhost:5432/lumolearn',
      maxPoolSize: parseInt(process.env.PG_MAX_POOL_SIZE || '10'),
      idleTimeoutMs: parseInt(process.env.PG_IDLE_TIMEOUT_MS || '30000'),
      connectionTimeoutMs: parseInt(process.env.PG_CONNECTION_TIMEOUT_MS || '5000'),
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PostgresDatabase {
    if (!PostgresDatabase.instance) {
      PostgresDatabase.instance = new PostgresDatabase();
    }
    return PostgresDatabase.instance;
  }

  /**
   * Initialize connection pool
   */
  public async connect(): Promise<void> {
    try {
      if (this.pool) {
        console.log('PostgreSQL pool already initialized');
        return;
      }

      console.log('Initializing PostgreSQL connection pool...');

      this.pool = new Pool({
        connectionString: this.config.connectionString,
        max: this.config.maxPoolSize,
        idleTimeoutMillis: this.config.idleTimeoutMs,
        connectionTimeoutMillis: this.config.connectionTimeoutMs,
      });

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      console.log('✓ PostgreSQL connected successfully');
    } catch (error) {
      console.error('PostgreSQL connection error:', error);
      throw error;
    }
  }

  /**
   * Get connection pool
   */
  public getPool(): Pool {
    if (!this.pool) {
      throw new Error('PostgreSQL pool not initialized. Call connect() first.');
    }
    return this.pool;
  }

  /**
   * Execute a query
   */
  public async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    const pool = this.getPool();
    const start = Date.now();
    
    try {
      const result = await pool.query<T>(text, params);
      const duration = Date.now() - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PG Query] ${duration}ms - ${text.substring(0, 100)}...`);
      }
      
      return result;
    } catch (error) {
      console.error('PostgreSQL query error:', error);
      throw error;
    }
  }

  /**
   * Get a client from pool for transactions
   */
  public async getClient(): Promise<PoolClient> {
    const pool = this.getPool();
    return pool.connect();
  }

  /**
   * Check if database is connected
   */
  public isConnected(): boolean {
    return this.pool !== null;
  }

  /**
   * Close connection pool
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.pool) {
        await this.pool.end();
        this.pool = null;
        console.log('PostgreSQL disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting from PostgreSQL:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const postgresDb = PostgresDatabase.getInstance();

