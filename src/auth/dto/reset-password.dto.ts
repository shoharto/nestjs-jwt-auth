import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'New password must be at least 8 characters long',
  })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}
