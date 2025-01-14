import { Module } from '@nestjs/common';
import { SendGridService } from './services/sendgrid.service';
import { BrevoService } from './services/brevo.service';
import { EmailService } from './email.service';
import { EmailTemplateService } from './services/email-template.service';

@Module({
  providers: [
    SendGridService,
    BrevoService,
    EmailService,
    EmailTemplateService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
