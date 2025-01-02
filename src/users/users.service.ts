import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserProps } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(userData: UserProps): Promise<User> {
    try {
      const user = await User.create(userData);
      return this.usersRepository.save(user);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === '23505') {
          throw new ConflictException('Email already exists');
        }
      }
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { emailVerificationToken: token },
    });
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { passwordResetToken: token },
    });
  }

  async markEmailAsVerified(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiresAt = undefined;

    return this.usersRepository.save(user);
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
}
