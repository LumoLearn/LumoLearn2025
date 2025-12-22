import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTotalQuestionsToQuizAttempts1734782400000 implements MigrationInterface {
    name = 'AddTotalQuestionsToQuizAttempts1734782400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_attempts" ADD "total_questions" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_attempts" DROP COLUMN "total_questions"`);
    }

}
