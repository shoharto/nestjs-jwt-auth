export interface IEmailConfig {
  fromEmail: string;
  fromName?: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}
