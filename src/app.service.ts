import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.dataSource.query('SELECT 1');
      this.logger.log('Database connection established successfully');
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Database connection failed', {
          error: error.message,
          stack: error.stack,
        });
      }
    }
  }

  getHello(): string {
    this.logger.verbose('Hello endpoint called');
    return 'Hello World!';
  }

  async getDatabaseStatus(): Promise<string> {
    try {
      const result = await this.dataSource.query('SELECT NOW()');
      if (!result?.[0]?.now) {
        throw new Error('Invalid database response');
      }

      this.logger.debug('Database query executed successfully', {
        timestamp: result[0].now,
      });
      return `Database is connected! Current timestamp: ${result[0].now}`;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Database query failed', {
          error: error.message,
          stack: error.stack,
        });
        return `Database connection error: ${error.message}`;
      }
      return 'An unknown error occurred';
    }
  }
}
