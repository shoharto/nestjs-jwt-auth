import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';

config();

const configService = new ConfigService();

const port = configService.get('DB_PORT')
  ? parseInt(configService.get('DB_PORT') as string, 10)
  : 5432;

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST') ?? 'localhost',
  port,
  username: configService.get('DB_USERNAME') ?? 'postgres',
  password: configService.get('DB_PASSWORD') ?? '',
  database: configService.get('DB_NAME') ?? 'nest_jwt_auth',
  entities: [User, RefreshToken],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
