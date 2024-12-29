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
  };
});
