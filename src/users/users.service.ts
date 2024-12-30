import { Injectable, ConflictException } from '@nestjs/common';
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
      const user = User.create(userData);
      return await this.usersRepository.save(user);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === '23505') {
          throw new ConflictException('Email already exists');
        }
      }
      throw error;
    }
  }
}
