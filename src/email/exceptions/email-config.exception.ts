import { BadRequestException } from '@nestjs/common';

export class EmailConfigException extends BadRequestException {
  constructor(configKey: string) {
    super(`Email configuration missing: ${configKey}`);
  }
}
