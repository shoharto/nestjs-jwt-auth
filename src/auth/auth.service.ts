import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { RefreshTokenService } from './refresh-token.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      this.logger.warn(
        `Registration attempted with existing email: ${registerDto.email}`,
      );
      throw new UnauthorizedException('Email already exists');
    }

    const user = await this.usersService.create(registerDto);
    const token = this.generateToken(user);

    this.logger.log(`User registered successfully: ${user.email}`);
    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);
    const accessToken = this.generateAccessToken(user);
    const refreshToken =
      await this.refreshTokenService.createRefreshToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async refreshToken(token: string) {
    const refreshToken =
      await this.refreshTokenService.verifyRefreshToken(token);
    const accessToken = this.generateAccessToken(refreshToken.user);

    // Optional: Create new refresh token and revoke old one
    await this.refreshTokenService.revokeRefreshToken(token);
    const newRefreshToken = await this.refreshTokenService.createRefreshToken(
      refreshToken.user,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken.token,
    };
  }

  private generateToken(user: any) {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  private generateAccessToken(user: User): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('env.jwt.secret'),
      expiresIn: this.configService.get<string>('env.jwt.expiresIn'),
    });
  }

  private async validateUser(loginDto: LoginDto): Promise<User> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      this.logger.warn(
        `Login attempted with non-existent email: ${loginDto.email}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password attempt for user: ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
