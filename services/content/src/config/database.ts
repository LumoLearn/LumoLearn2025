import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MongoDB Database Configuration
 *
 * Manages connection to MongoDB for storing lesson and quiz content
 */

class DatabaseConfig {
  private static instance: DatabaseConfig;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private readonly url: string;
  private readonly dbName: string;

  private constructor() {
    this.url = process.env.MONGODB_URL || 'mongodb://localhost:27017';
    this.dbName = process.env.MONGODB_DB_NAME || 'lumolearn_content';
  }

  /**
   * Get singleton instance of DatabaseConfig
   */
  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  /**
   * Connect to MongoDB
   */
  public async connect(): Promise<void> {
    try {
      if (this.client) {
        console.log('MongoDB already connected');
        return;
      }

      console.log(`Connecting to MongoDB at ${this.url}...`);

      this.client = new MongoClient(this.url, {
        maxPoolSize: 10,
        minPoolSize: 2,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 30000,
      });

      await this.client.connect();
      this.db = this.client.db(this.dbName);

      // Test the connection
      await this.db.command({ ping: 1 });

      console.log(`✓ MongoDB connected successfully to database: ${this.dbName}`);
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  /**
   * Get database instance
   */
  public getDb(): Db {
    if (!this.db) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Get MongoDB client
   */
  public getClient(): MongoClient {
    if (!this.client) {
      throw new Error('MongoDB client not initialized. Call connect() first.');
    }
    return this.client;
  }

  /**
   * Check if database is connected
   */
  public isConnected(): boolean {
    return this.client !== null && this.db !== null;
  }

  /**
   * Close MongoDB connection
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
        console.log('MongoDB disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const mongoDb = DatabaseConfig.getInstance();
