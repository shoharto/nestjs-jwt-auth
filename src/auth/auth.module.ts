import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenService } from './refresh-token.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { EmailModule } from '../email/email.module';
import { EmailVerifiedGuard } from './guards/email-verified.guard';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('env.jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('env.jwt.expiresIn'),
        },
      }),
    }),
    TypeOrmModule.forFeature([RefreshToken]),
    EmailModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    EmailVerifiedGuard,
  ],
  controllers: [AuthController],
  exports: [JwtStrategy, EmailVerifiedGuard, RefreshTokenService],
})
export class AuthModule {}
