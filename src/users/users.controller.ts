import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(EmailVerifiedGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user profile information',
  })
  @ApiResponse({
    status: 401,
    description: 'Email not verified',
  })
  async getProfile(@GetUser() user: User) {
    const fullUser = await this.usersService.findByEmail(user.email);
    return {
      id: fullUser?.id,
      email: fullUser?.email,
      name: fullUser?.name,
    };
  }
}
