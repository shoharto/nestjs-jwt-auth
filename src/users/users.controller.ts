import { Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { ApiVersionController } from '../common/decorators/version.decorator';

@ApiVersionController({
  path: 'users',
  tag: 'users',
})
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
      status: true,
      message: 'Profile retrieved successfully',
      data: {
        id: fullUser?.id,
        email: fullUser?.email,
        name: fullUser?.name,
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all users',
  })
  @ApiResponse({
    status: 401,
    description: 'Email not verified',
  })
  async getAllUsers() {
    const users = await this.usersService.findAll();
    return {
      status: true,
      message: 'Users retrieved successfully',
      data: users,
    };
  }
}
