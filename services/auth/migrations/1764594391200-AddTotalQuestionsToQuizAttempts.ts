import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTotalQuestionsToQuizAttempts1764594391200 implements MigrationInterface {
    name = 'AddTotalQuestionsToQuizAttempts1764594391200'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_attempts" ADD "total_questions" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_attempts" DROP COLUMN "total_questions"`);
    }

}
