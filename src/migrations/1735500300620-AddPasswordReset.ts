import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordReset1735500300620 implements MigrationInterface {
  name = 'AddPasswordReset1735500300620';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "passwordResetToken" character varying,
      ADD COLUMN "passwordResetTokenExpiresAt" TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "passwordResetToken",
      DROP COLUMN "passwordResetTokenExpiresAt"
    `);
  }
}
