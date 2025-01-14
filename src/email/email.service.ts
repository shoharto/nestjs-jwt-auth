import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendGridService } from './services/sendgrid.service';
import { BrevoService } from './services/brevo.service';
import { EmailProvider } from './enums/email-provider.enum';
import { IEmailService } from './interfaces/email-service.interface';
import { EmailConfigException } from './exceptions/email-config.exception';

@Injectable()
export class EmailService implements IEmailService {
  private emailService: IEmailService;

  constructor(
    private readonly configService: ConfigService,
    private readonly sendGridService: SendGridService,
    private readonly brevoService: BrevoService,
  ) {
    this.emailService = this.getEmailProvider();
  }

  private getEmailProvider(): IEmailService {
    const provider =
      this.configService.get<string>('EMAIL_PROVIDER') ||
      EmailProvider.SENDGRID;
    if (!Object.values(EmailProvider).includes(provider as EmailProvider)) {
      throw new EmailConfigException('EMAIL_PROVIDER');
    }
    return provider === EmailProvider.BREVO
      ? this.brevoService
      : this.sendGridService;
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    return this.emailService.sendVerificationEmail(email, token);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    return this.emailService.sendPasswordResetEmail(email, token);
  }
}
