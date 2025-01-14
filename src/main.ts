import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { VersioningType } from '@nestjs/common';
import { API_VERSION } from './common/constants/api-versions.constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    bufferLogs: true,
  });

  // Add CORS configuration
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('env.port') ?? 3000;

  // Update versioning configuration
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSION.V1,
    prefix: 'api/v',
  });

  const swaggerConfig = configService.get('env.swagger');
  const logger = new Logger('Bootstrap');

  // Swagger configuration
  if (swaggerConfig?.enabled) {
    const config = new DocumentBuilder()
      .setTitle('NestJS JWT Auth API')
      .setDescription('The NestJS JWT Auth API description')
      .setVersion(API_VERSION.V1)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerConfig.path, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        security: [{ 'JWT-auth': [] }],
      },
    });

    logger.log(`📝 Swagger UI enabled at path: ${swaggerConfig.path}`);
  } else {
    logger.warn('⚠️ Swagger UI is disabled');
  }

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port);

  // Updated logging with versioned API paths
  logger.log(
    `🚀 Application is running on: http://localhost:${port}/api/v${API_VERSION.V1}`,
  );

  if (swaggerConfig?.enabled) {
    logger.log(
      `📚 API Documentation available at: http://localhost:${port}/${swaggerConfig.path}`,
    );
  }

  logger.log(`🔒 Environment: ${configService.get('NODE_ENV')}`);
  logger.log(`🌐 API Version: v${API_VERSION.V1}`);

  // Debug route registration
  const server = app.getHttpServer();
  const router = server._events.request._router;
  logger.log('Registered Routes:');
  router.stack.forEach(
    (layer: { route?: { stack: { method: string }[]; path: string } }) => {
      if (layer.route) {
        logger.log(
          `${layer.route.stack[0].method.toUpperCase()} ${layer.route.path}`,
        );
      }
    },
  );
}

bootstrap();
