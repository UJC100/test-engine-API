import { MigrationInterface, QueryRunner } from "typeorm";

export class SecondMigration1721218636403 implements MigrationInterface {
    name = 'SecondMigration1721218636403'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_signup" DROP COLUMN "age"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_signup" ADD "age" character varying`);
    }

}
