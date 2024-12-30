import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

export interface UserProps {
  email: string;
  password: string;
  name?: string;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  name: string = '';

  constructor(props?: UserProps) {
    if (props) {
      this.email = props.email;
      this.password = props.password;
      this.name = props.name ?? '';
    }
  }

  static create(props: UserProps): User {
    return new User(props);
  }

  @BeforeInsert()
  private async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  toJSON() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...rest } = this;
    return rest;
  }
}
