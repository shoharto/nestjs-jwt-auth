import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('env.jwt.secret'),
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        this.logger.warn(
          `JWT validation failed: User not found for email ${payload.email}`,
        );
        throw new UnauthorizedException('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      };
    } catch (err) {
      this.logger.error('JWT validation error', {
        error: err instanceof Error ? err.message : 'Unknown error',
        email: payload.email,
      });
      throw new UnauthorizedException('Invalid token payload');
    }
  }
}
