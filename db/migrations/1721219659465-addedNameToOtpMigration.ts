import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedNameToOtpMigration1721219659465 implements MigrationInterface {
    name = 'AddedNameToOtpMigration1721219659465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp" ADD "name" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "name"`);
    }

}
