import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { RefreshTokenService } from './refresh-token.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../email/email.service';
import { TOKEN_EXPIRATION } from './constants/token-expiration.constant';
import { IAuthResponse } from './interfaces/auth-response.interface';
import { ILoginResponse } from './interfaces/login-response.interface';
import { IRegisterResponse } from './interfaces/register-response.interface';
import { handleAuthError } from '../common/utils/error-handler.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<IAuthResponse<IRegisterResponse>> {
    try {
      const existingUser = await this.usersService.findByEmail(
        registerDto.email,
      );
      if (existingUser) {
        throw new UnauthorizedException('Email already exists');
      }

      const emailVerificationToken = uuidv4();
      const emailVerificationTokenExpiresAt =
        this.createExpirationDate('EMAIL_VERIFICATION');

      const user = await this.usersService.create({
        ...registerDto,
        emailVerificationToken,
        emailVerificationTokenExpiresAt,
      });

      await this.emailService.sendVerificationEmail(
        user.email,
        emailVerificationToken,
      );

      const token = this.generateToken(user);

      return {
        status: true,
        message: 'Please check your email to verify your account',
        data: {
          user: user.toJSON(),
          token,
        },
      };
    } catch (error: unknown) {
      handleAuthError(this.logger, error, 'Registration', registerDto.email);
    }
  }

  async login(loginDto: LoginDto): Promise<IAuthResponse<ILoginResponse>> {
    try {
      const user = await this.getUserOrThrow(undefined, loginDto.email);
      const isValidUser = await this.validateUser(loginDto);

      if (!isValidUser) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const accessToken = this.generateToken(user);
      await this.refreshTokenService.createRefreshToken(user);

      return {
        status: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          token: accessToken,
        },
      };
    } catch (error: unknown) {
      handleAuthError(this.logger, error, 'Login', loginDto.email);
    }
  }

  async refreshToken(token: string) {
    const refreshToken =
      await this.refreshTokenService.verifyRefreshToken(token);
    const accessToken = this.generateToken(refreshToken.user);

    await this.refreshTokenService.revokeRefreshToken(token);
    const newRefreshToken = await this.refreshTokenService.createRefreshToken(
      refreshToken.user,
    );

    return {
      status: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken.token,
      },
    };
  }

  private generateToken(user: User, options?: { expiresIn?: string }): string {
    const payload = { email: user.email, sub: user.id };
    const secret = this.configService.get<string>('JWT_SECRET');

    return this.jwtService.sign(payload, {
      secret,
      expiresIn:
        options?.expiresIn || this.configService.get<string>('JWT_EXPIRES_IN'),
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

  async verifyEmail(token: string): Promise<IAuthResponse<null>> {
    try {
      const user = await this.usersService.findByEmailVerificationToken(token);

      if (!user || !user.emailVerificationTokenExpiresAt) {
        this.logger.warn(`Invalid verification token attempt: ${token}`);
        throw new UnauthorizedException('Invalid verification token');
      }

      const now = new Date();
      this.logger.debug('Token verification times:', {
        expiresAt: user.emailVerificationTokenExpiresAt,
        currentTime: now,
        isExpired: user.emailVerificationTokenExpiresAt < now,
      });

      if (user.emailVerificationTokenExpiresAt < now) {
        throw new UnauthorizedException('Verification token has expired');
      }

      await this.usersService.markEmailAsVerified(user.id);

      return {
        status: true,
        message: 'Email verified successfully',
        data: null,
      };
    } catch (error: unknown) {
      handleAuthError(this.logger, error, 'Email Verification', undefined);
    }
  }

  async resendVerificationEmail(email: string): Promise<IAuthResponse<null>> {
    const user = await this.getUserOrThrow(undefined, email);

    if (user.isEmailVerified) {
      throw new UnauthorizedException('Email is already verified');
    }

    const emailVerificationToken = uuidv4();
    const emailVerificationTokenExpiresAt = new Date();
    emailVerificationTokenExpiresAt.setHours(
      emailVerificationTokenExpiresAt.getHours() +
        TOKEN_EXPIRATION.EMAIL_VERIFICATION,
    );

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpiresAt = emailVerificationTokenExpiresAt;

    await this.usersService.save(user);
    await this.emailService.sendVerificationEmail(
      user.email,
      emailVerificationToken,
    );

    return {
      status: true,
      message: 'Verification email has been resent',
      data: null,
    };
  }

  async forgotPassword(email: string): Promise<IAuthResponse<null>> {
    const user = await this.getUserOrThrow(undefined, email);

    const resetToken = uuidv4();
    const resetTokenExpiresAt = new Date();
    resetTokenExpiresAt.setHours(
      resetTokenExpiresAt.getHours() + TOKEN_EXPIRATION.PASSWORD_RESET,
    );

    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpiresAt = resetTokenExpiresAt;
    await this.usersService.save(user);

    await this.emailService.sendPasswordResetEmail(email, resetToken);

    return {
      status: true,
      message: 'Password reset instructions sent to email',
      data: null,
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<IAuthResponse> {
    const user = await this.usersService.findByPasswordResetToken(token);
    if (!user || !user.passwordResetTokenExpiresAt) {
      throw new UnauthorizedException('Invalid reset token');
    }

    if (user.passwordResetTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Reset token has expired');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await this.usersService.save(user);

    return {
      status: true,
      message: 'Password reset successful',
      data: null,
    };
  }

  async logout(refreshToken: string): Promise<IAuthResponse> {
    await this.refreshTokenService.revokeRefreshToken(refreshToken);
    return {
      status: true,
      message: 'Logged out successfully',
      data: null,
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<IAuthResponse<null>> {
    const user = await this.getUserOrThrow(userId);

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersService.save(user);

    return {
      status: true,
      message: 'Password changed successfully',
      data: null,
    };
  }

  private async getUserOrThrow(userId?: string, email?: string): Promise<User> {
    let user: User | null = null;

    if (email) {
      user = await this.usersService.findByEmail(email);
    } else if (userId) {
      user = await this.usersService.findById(userId);
    }

    if (!user) {
      this.logger.warn(`User not found: ${email || userId}`);
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private createExpirationDate(type: keyof typeof TOKEN_EXPIRATION): Date {
    const date = new Date();
    date.setHours(date.getHours() + TOKEN_EXPIRATION[type]);
    return date;
  }

  private createAuthResponse<T>(
    status: boolean,
    message: string,
    data?: T | null,
  ): IAuthResponse<T> {
    return {
      status,
      message,
      data: data ?? null,
    };
  }
}
