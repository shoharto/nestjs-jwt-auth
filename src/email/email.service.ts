import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is not defined');
    }
    SendGrid.setApiKey(apiKey);
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const fromEmail = this.configService.get<string>('EMAIL_FROM');
    if (!fromEmail) {
      throw new Error('EMAIL_FROM is not defined');
    }

    const baseUrl = this.configService.get<string>('APP_URL');
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

    const mail = {
      to: email,
      from: fromEmail,
      subject: 'Email Verification',
      text: `Please verify your email by clicking this link: ${verificationUrl}`,
      html: `
        <div>
          <h1>Email Verification</h1>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verificationUrl}">
            Verify Email
          </a>
        </div>
      `,
    };

    try {
      await SendGrid.send(mail as any);
      this.logger.log(`Verification email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const fromEmail = this.configService.get<string>('EMAIL_FROM');
    if (!fromEmail) {
      throw new Error('EMAIL_FROM is not defined');
    }

    const baseUrl = this.configService.get<string>('APP_URL');
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const mail = {
      to: email,
      from: fromEmail,
      subject: 'Password Reset Request',
      text: `Reset your password by clicking this link: ${resetUrl}`,
      html: `
        <div>
          <h1>Password Reset</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
        </div>
      `,
    };

    try {
      await SendGrid.send(mail as any);
      this.logger.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error,
      );
      return false;
    }
  }
}
