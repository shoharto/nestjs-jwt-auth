import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampsToUsers1735500300620 implements MigrationInterface {
  name = 'AddTimestampsToUsers1735500300620';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      ADD COLUMN "updated_at" TIMESTAMP NOT NULL DEFAULT now()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "created_at",
      DROP COLUMN "updated_at"
    `);
  }
}
