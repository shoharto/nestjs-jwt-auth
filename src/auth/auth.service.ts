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

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      this.logger.warn(
        `Registration attempted with existing email: ${registerDto.email}`,
      );
      throw new UnauthorizedException('Email already exists');
    }

    const emailVerificationToken = uuidv4();
    const emailVerificationTokenExpiresAt = new Date();
    emailVerificationTokenExpiresAt.setHours(
      emailVerificationTokenExpiresAt.getHours() + 24,
    );

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

    this.logger.log(`User registered successfully: ${user.email}`);
    return {
      status: true,
      message: 'Please check your email to verify your account',
      data: {
        user: this.sanitizeUser(user),
        token,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);
    const accessToken = this.generateAccessToken(user);
    const refreshToken =
      await this.refreshTokenService.createRefreshToken(user);

    return {
      status: true,
      message: 'Login successful',
      data: {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken: refreshToken.token,
      },
    };
  }

  async refreshToken(token: string) {
    const refreshToken =
      await this.refreshTokenService.verifyRefreshToken(token);
    const accessToken = this.generateAccessToken(refreshToken.user);

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

  async verifyEmail(token: string) {
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
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isEmailVerified) {
      throw new UnauthorizedException('Email is already verified');
    }

    const emailVerificationToken = uuidv4();
    const emailVerificationTokenExpiresAt = new Date();
    emailVerificationTokenExpiresAt.setHours(
      emailVerificationTokenExpiresAt.getHours() + 24,
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

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const resetToken = uuidv4();
    const resetTokenExpiresAt = new Date();
    resetTokenExpiresAt.setHours(resetTokenExpiresAt.getHours() + 1);

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

  async resetPassword(token: string, newPassword: string) {
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

  async logout(refreshToken: string) {
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
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

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
}
