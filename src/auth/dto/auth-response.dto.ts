import { ApiProperty } from '@nestjs/swagger';
import { IAuthResponse } from '../interfaces/auth-response.interface';

export class AuthResponseDto<T = null> implements IAuthResponse<T> {
  @ApiProperty({ type: Boolean })
  status: boolean = false;

  @ApiProperty({ type: String })
  message: string = '';

  @ApiProperty({
    nullable: true,
    type: 'object',
    additionalProperties: true,
    description: 'Response data object',
  })
  data!: T;

  constructor(partial: Partial<AuthResponseDto<T>>) {
    Object.assign(this, partial);
  }
}
