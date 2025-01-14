import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailTemplate } from '../interfaces/email-template.interface';
import { EmailConfigException } from '../exceptions/email-config.exception';

@Injectable()
export class EmailTemplateService {
  constructor(private readonly configService: ConfigService) {}

  private getBaseUrl(): string {
    const baseUrl = this.configService.get<string>('APP_URL');
    if (!baseUrl) {
      throw new EmailConfigException('APP_URL');
    }
    return baseUrl;
  }

  getVerificationEmailTemplate(email: string, token: string): IEmailTemplate {
    const baseUrl = this.getBaseUrl();
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

    return {
      subject: 'Email Verification',
      text: `Please verify your email by clicking this link: ${verificationUrl}`,
      html: `
        <div>
          <h1>Email Verification</h1>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verificationUrl}">Verify Email</a>
        </div>
      `,
    };
  }

  getPasswordResetTemplate(email: string, token: string): IEmailTemplate {
    const baseUrl = this.getBaseUrl();
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    return {
      subject: 'Password Reset Request',
      text: `You requested to reset your password. Click this link to reset it: ${resetUrl}`,
      html: `
        <div>
          <h1>Password Reset Request</h1>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    };
  }
}
