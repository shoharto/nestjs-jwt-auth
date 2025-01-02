import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmailWithVerification(email: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .select(['user.id', 'user.email', 'user.isEmailVerified'])
      .getOne();
  }
}
