import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { Logger } from '@nestjs/common';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  public db: ReturnType<typeof drizzle<typeof schema>>;

  constructor(private readonly logger: Logger) {
    // Initialize the connection pool
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased timeout for remote databases
    });


      const originalQuery = this.pool.query.bind(this.pool);

      this.pool.query = (...args: any[]) => {
        try {
          const text = args[0];
          const params = args[1];

          const queryText = typeof text === 'string' ? text : JSON.stringify(text).replaceAll('\\\"', '').trim();
          const logMessage = params
            ? `${queryText} | Params: ${JSON.stringify(params)}`
            : queryText;

          this.logger.debug(logMessage);
        } catch (err) {
          // swallow logging errors
        }
        // @ts-ignore delegate to original
        return originalQuery(...args);
      };

    this.db = drizzle(this.pool, { schema });
  }

  async onModuleInit() {
    try {
      await this.pool.query('SELECT 1');
      this.logger.debug('Database connection established successfully');
    } catch (error) {
      this.logger.error('Failed to establish database connection', { error });
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.debug('Database connection pool closed');
  }

  getDatabase() {
    return this.db;
  }

  getPool() {
    return this.pool;
  }
}
