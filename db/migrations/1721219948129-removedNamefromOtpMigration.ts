import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedNamefromOtpMigration1721219948129 implements MigrationInterface {
    name = 'RemovedNamefromOtpMigration1721219948129'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "name"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp" ADD "name" character varying NOT NULL`);
    }

}
