import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'currentPassword123',
    description: 'Current password',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'New password must be at least 8 characters long',
  })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
