import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailTemplateService } from './email-template.service';
import { EmailConfigException } from '../exceptions/email-config.exception';
import { EmailType } from '../enums/email-type.enum';
import { IEmailConfig } from '../interfaces/email-config.interface';
import { IEmailTemplate } from '../interfaces/email-template.interface';

export abstract class BaseEmailService {
  protected constructor(
    protected readonly configService: ConfigService,
    protected readonly emailTemplateService: EmailTemplateService,
    protected readonly logger: Logger,
  ) {}

  protected getEmailConfig() {
    const fromEmail = this.configService.get<string>('EMAIL_FROM');
    const fromName = this.configService.get<string>('EMAIL_FROM_NAME');

    if (!fromEmail) {
      throw new EmailConfigException('EMAIL_FROM');
    }

    return { fromEmail, fromName };
  }

  protected async handleEmailSend(
    email: string,
    emailType: EmailType,
    sendFunction: () => Promise<void>,
  ): Promise<boolean> {
    try {
      await sendFunction();
      this.logger.log(`${emailType} email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send ${emailType} email to ${email}`, error);
      return false;
    }
  }

  protected async prepareEmailConfig(
    email: string,
    template: IEmailTemplate,
  ): Promise<IEmailConfig> {
    const { fromEmail, fromName } = this.getEmailConfig();

    const config: IEmailConfig = {
      fromEmail,
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    if (fromName) {
      config.fromName = fromName;
    }

    return config;
  }
}
