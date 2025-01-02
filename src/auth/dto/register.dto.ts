import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'bayes@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password must be at least 8 characters long',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @ApiProperty({ example: 'Bayes Ahmed' })
  @IsString()
  name!: string;
}
