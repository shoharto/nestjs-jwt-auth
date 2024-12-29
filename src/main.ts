import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const globalPrefix = configService.get<string>('env.apiPrefix') ?? 'api';
  app.setGlobalPrefix(globalPrefix);

  // Swagger configuration
  const swaggerConfig = configService.get('env.swagger');
  const logger = new Logger('Bootstrap');

  logger.debug('Swagger config:', swaggerConfig);

  if (swaggerConfig?.enabled) {
    const config = new DocumentBuilder()
      .setTitle('NestJS JWT Auth API')
      .setDescription('The NestJS JWT Auth API description')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerConfig.path, app, document);

    logger.log(`Swagger UI enabled at path: ${swaggerConfig.path}`);
  } else {
    logger.warn('Swagger UI is disabled');
  }

  const port = configService.get<number>('env.port') ?? 3000;
  await app.listen(port);

  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );

  if (swaggerConfig?.enabled) {
    logger.log(
      `📚 Swagger documentation is available at: http://localhost:${port}/${swaggerConfig.path}`,
    );
  }
}
bootstrap();
