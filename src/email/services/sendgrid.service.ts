import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import { IEmailService } from '../interfaces/email-service.interface';
import { EmailTemplateService } from './email-template.service';
import { BaseEmailService } from './base-email.service';
import { EmailConfigException } from '../exceptions/email-config.exception';
import { EmailType } from '../enums/email-type.enum';

@Injectable()
export class SendGridService extends BaseEmailService implements IEmailService {
  constructor(
    configService: ConfigService,
    emailTemplateService: EmailTemplateService,
  ) {
    super(
      configService,
      emailTemplateService,
      new Logger(SendGridService.name),
    );

    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      throw new EmailConfigException('SENDGRID_API_KEY');
    }
    SendGrid.setApiKey(apiKey);
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    return this.handleEmailSend(email, EmailType.VERIFICATION, async () => {
      const { fromEmail, fromName } = this.getEmailConfig();
      const template = this.emailTemplateService.getVerificationEmailTemplate(
        email,
        token,
      );

      const mail = {
        to: email,
        from: {
          email: fromEmail,
          name: fromName,
        },
        ...template,
      };

      await SendGrid.send(mail);
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    return this.handleEmailSend(email, EmailType.PASSWORD_RESET, async () => {
      const { fromEmail, fromName } = this.getEmailConfig();
      const template = this.emailTemplateService.getPasswordResetTemplate(
        email,
        token,
      );

      const mail = {
        to: email,
        from: {
          email: fromEmail,
          name: fromName,
        },
        ...template,
      };

      await SendGrid.send(mail);
    });
  }
}
