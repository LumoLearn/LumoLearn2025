import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUpdatedAtToQuizzes1764594391126 implements MigrationInterface {
    name = 'AddUpdatedAtToQuizzes1764594391126'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quizzes" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quizzes" DROP COLUMN "updated_at"`);
    }

}
