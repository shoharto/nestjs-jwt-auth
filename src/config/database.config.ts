import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;

  if (isNaN(port)) {
    throw new Error('Invalid database port configuration');
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port,
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'nest_jwt_auth',
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
    ssl: process.env.NODE_ENV === 'production',
    extra: {
      max: 20,
      connectionTimeoutMillis: 5000,
    },
    autoLoadEntities: true,
  } as TypeOrmModuleOptions;
};

export default registerAs('database', getDatabaseConfig);
