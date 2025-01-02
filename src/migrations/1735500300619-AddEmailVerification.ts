import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailVerification1735500300619 implements MigrationInterface {
  name = 'AddEmailVerification1735500300619';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "isEmailVerified" boolean NOT NULL DEFAULT false,
      ADD COLUMN "emailVerificationToken" character varying,
      ADD COLUMN "emailVerificationTokenExpiresAt" TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "isEmailVerified",
      DROP COLUMN "emailVerificationToken",
      DROP COLUMN "emailVerificationTokenExpiresAt"
    `);
  }
}