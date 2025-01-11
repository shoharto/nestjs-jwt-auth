import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { RefreshTokenService } from '../refresh-token.service';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(
    private usersService: UsersService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Handle refresh token endpoint differently
    if (request.path === '/api/v1/auth/refresh') {
      const refreshToken = request.body.refreshToken;
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token is required');
      }

      const token =
        await this.refreshTokenService.verifyRefreshToken(refreshToken);
      const user = token.user;

      if (!user?.isEmailVerified) {
        throw new UnauthorizedException('Email not verified');
      }

      return true;
    }

    // Handle other endpoints
    const user = await this.usersService.findByEmail(request.user?.email);
    if (!user?.isEmailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    return true;
  }
}
