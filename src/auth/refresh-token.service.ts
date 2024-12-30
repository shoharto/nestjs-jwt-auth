import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  private parseExpirationTime(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60 * 1000; // days to milliseconds
      case 'h':
        return value * 60 * 60 * 1000; // hours to milliseconds
      case 'm':
        return value * 60 * 1000; // minutes to milliseconds
      case 's':
        return value * 1000; // seconds to milliseconds
      default:
        throw new Error('Invalid expiration time format');
    }
  }

  async createRefreshToken(user: User): Promise<RefreshToken> {
    const expiresIn =
      this.configService.get<string>('env.jwt.refreshExpiresIn') ?? '7d';
    const token = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get<string>('env.jwt.refreshSecret'),
        expiresIn,
      },
    );

    const expirationMs = this.parseExpirationTime(expiresIn);
    const refreshToken = this.refreshTokenRepository.create({
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + expirationMs),
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  async verifyRefreshToken(token: string): Promise<RefreshToken> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token, isRevoked: false },
      relations: ['user'],
    });

    if (!refreshToken || new Date() > refreshToken.expiresAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return refreshToken;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update({ token }, { isRevoked: true });
  }
}
