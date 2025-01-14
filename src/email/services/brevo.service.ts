import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Brevo from '@getbrevo/brevo';
import { IEmailService } from '../interfaces/email-service.interface';
import { EmailTemplateService } from './email-template.service';
import { BaseEmailService } from './base-email.service';
import { EmailConfigException } from '../exceptions/email-config.exception';
import { EmailType } from '../enums/email-type.enum';

@Injectable()
export class BrevoService extends BaseEmailService implements IEmailService {
  private readonly brevoClient: Brevo.TransactionalEmailsApi;

  constructor(
    configService: ConfigService,
    emailTemplateService: EmailTemplateService,
  ) {
    super(configService, emailTemplateService, new Logger(BrevoService.name));

    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    if (!apiKey) {
      throw new EmailConfigException('BREVO_API_KEY');
    }

    this.brevoClient = new Brevo.TransactionalEmailsApi();
    this.brevoClient.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      apiKey,
    );
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    return this.handleEmailSend(email, EmailType.VERIFICATION, async () => {
      const template = this.emailTemplateService.getVerificationEmailTemplate(
        email,
        token,
      );
      const config = await this.prepareEmailConfig(email, template);

      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = config.subject;
      sendSmtpEmail.htmlContent = config.html;
      sendSmtpEmail.sender = {
        email: config.fromEmail,
        ...(config.fromName && { name: config.fromName }),
      };
      sendSmtpEmail.to = [{ email: config.to }];

      await this.brevoClient.sendTransacEmail(sendSmtpEmail);
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    return this.handleEmailSend(email, EmailType.PASSWORD_RESET, async () => {
      const { fromEmail, fromName } = this.getEmailConfig();
      const template = this.emailTemplateService.getPasswordResetTemplate(
        email,
        token,
      );

      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = template.subject;
      sendSmtpEmail.htmlContent = template.html;
      sendSmtpEmail.sender = { email: fromEmail, name: fromName };
      sendSmtpEmail.to = [{ email: email }];

      await this.brevoClient.sendTransacEmail(sendSmtpEmail);
    });
  }
}
