import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Brisanje lekcije/kviza je dosad failovalo zbog RESTRICT FK-ova.
 * Ova migracija rekreira FK-ove sa ON DELETE CASCADE:
 *  - quiz_attempts.quiz_id      -> quizzes(id)
 *  - quizzes.lesson_id          -> lessons(id)
 * Tako brisanje lekcije automatski briše njene kvizove, a brisanje
 * kviza briše sve pokušaje tog kviza.
 */
export class AddCascadeDeleteOnQuizLessonFKs1776000000000 implements MigrationInterface {
    name = 'AddCascadeDeleteOnQuizLessonFKs1776000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // quiz_attempts.quiz_id -> quizzes.id
        await queryRunner.query(
            `ALTER TABLE "quiz_attempts" DROP CONSTRAINT IF EXISTS "FK_a720e260138b64fcff2fca19b2d"`
        );
        await queryRunner.query(
            `ALTER TABLE "quiz_attempts"
             ADD CONSTRAINT "FK_quiz_attempts_quiz_id"
             FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );

        // quizzes.lesson_id -> lessons.id
        await queryRunner.query(
            `ALTER TABLE "quizzes" DROP CONSTRAINT IF EXISTS "FK_2cf4e4b5b533af8dc6b38d4fa9b"`
        );
        await queryRunner.query(
            `ALTER TABLE "quizzes"
             ADD CONSTRAINT "FK_quizzes_lesson_id"
             FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "quizzes" DROP CONSTRAINT IF EXISTS "FK_quizzes_lesson_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "quizzes"
             ADD CONSTRAINT "FK_2cf4e4b5b533af8dc6b38d4fa9b"
             FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );

        await queryRunner.query(
            `ALTER TABLE "quiz_attempts" DROP CONSTRAINT IF EXISTS "FK_quiz_attempts_quiz_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "quiz_attempts"
             ADD CONSTRAINT "FK_a720e260138b64fcff2fca19b2d"
             FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }
}
