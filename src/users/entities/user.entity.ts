import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

export interface UserProps {
  email: string;
  password: string;
  name?: string;
  emailVerificationToken?: string;
  emailVerificationTokenExpiresAt?: Date;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column()
  password!: string;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ nullable: true })
  emailVerificationToken?: string;

  @Column({ nullable: true })
  emailVerificationTokenExpiresAt?: Date;

  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column({ nullable: true })
  passwordResetTokenExpiresAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(props?: UserProps) {
    if (props) {
      this.email = props.email;
      this.password = props.password;
      this.name = props.name ?? '';
    }
  }

  static async create(props: UserProps): Promise<User> {
    const user = new User();
    Object.assign(user, props);
    user.password = await bcrypt.hash(props.password, 10);
    return user;
  }

  @BeforeInsert()
  private async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  toJSON() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...user } = this;
    return user;
  }
}
