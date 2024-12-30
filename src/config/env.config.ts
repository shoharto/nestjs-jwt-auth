import { registerAs } from '@nestjs/config';

interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  isProduction: boolean;
  swagger: {
    enabled: boolean;
    path: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
}

export default registerAs('env', (): EnvironmentConfig => {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (isNaN(port)) {
    throw new Error('Invalid port configuration');
  }

  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port,
    apiPrefix: process.env.API_PREFIX ?? 'api',
    isProduction: process.env.NODE_ENV === 'production',
    swagger: {
      enabled: process.env.SWAGGER_ENABLED !== 'false',
      path: process.env.SWAGGER_PATH ?? 'api/docs',
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? 'your-secret-key',
      expiresIn: '30m',
      refreshSecret:
        process.env.JWT_REFRESH_SECRET ?? 'your-refresh-secret-key',
      refreshExpiresIn: '7d',
    },
  };
});
