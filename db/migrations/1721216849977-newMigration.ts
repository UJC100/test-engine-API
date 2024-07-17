import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1721216849977 implements MigrationInterface {
    name = 'NewMigration1721216849977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "base_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_03e6c58047b7a4b3f6de0bfa8d7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_signup" ADD "age" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_signup" DROP COLUMN "age"`);
        await queryRunner.query(`DROP TABLE "base_entity"`);
    }

}
