import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokens1735500300618 implements MigrationInterface {
  name = 'CreateRefreshTokens1735500300618';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table with all columns
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "name" character varying,
        "isEmailVerified" boolean NOT NULL DEFAULT false,
        "emailVerificationToken" character varying,
        "emailVerificationTokenExpiresAt" TIMESTAMP,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Create refresh_tokens table
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "token" character varying NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        "isRevoked" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_tokens_user" FOREIGN KEY ("userId") 
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
