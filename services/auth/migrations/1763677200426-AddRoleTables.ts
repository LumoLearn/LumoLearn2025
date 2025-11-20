import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleTables1763677200426 implements MigrationInterface {
    name = 'AddRoleTables1763677200426'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "teachers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, CONSTRAINT "UQ_4668d4752e6766682d1be0b346f" UNIQUE ("user_id"), CONSTRAINT "REL_4668d4752e6766682d1be0b346" UNIQUE ("user_id"), CONSTRAINT "PK_a8d4f83be3abe4c687b0a0093c8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "lessons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "teacher_id" uuid NOT NULL, "title" character varying(255) NOT NULL, "content_id" character varying(255), "is_published" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9b9a8d455cac672d262d7275730" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_91eb3280b50fe17091b191bbd9" ON "lessons" ("teacher_id") `);
        await queryRunner.query(`CREATE TABLE "quizzes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lesson_id" uuid, "teacher_id" uuid NOT NULL, "title" character varying(255) NOT NULL, "content_id" character varying(255), "status" character varying(50) NOT NULL DEFAULT 'draft', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b24f0f7662cf6b3a0e7dba0a1b4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2cf4e4b5b533af8dc6b38d4fa9" ON "quizzes" ("lesson_id") `);
        await queryRunner.query(`CREATE TABLE "quiz_attempts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quiz_id" uuid NOT NULL, "student_id" uuid NOT NULL, "score" integer, "answers" jsonb, "submitted_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a84a93fb092359516dc5b325b90" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "students" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "accessibility_settings" jsonb DEFAULT '{"font_family":"Arial","font_size":16,"line_spacing":1.5,"letter_spacing":0,"text_color":"#000000","background_color":"#FFFFFF"}', CONSTRAINT "UQ_fb3eff90b11bddf7285f9b4e281" UNIQUE ("user_id"), CONSTRAINT "REL_fb3eff90b11bddf7285f9b4e28" UNIQUE ("user_id"), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "parents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, CONSTRAINT "UQ_c94c3cea9b43a18c81269ded41d" UNIQUE ("user_id"), CONSTRAINT "REL_c94c3cea9b43a18c81269ded41" UNIQUE ("user_id"), CONSTRAINT "PK_9a4dc67c7b8e6a9cb918938d353" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "parent_student" ("parent_id" uuid NOT NULL, "student_id" uuid NOT NULL, CONSTRAINT "PK_23ccad4739345a07ab77436fbc4" PRIMARY KEY ("parent_id", "student_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_56c93c8885d58f23000148c9b2" ON "parent_student" ("parent_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_9c2fadef93e1c8a720c428e996" ON "parent_student" ("student_id") `);
        await queryRunner.query(`ALTER TABLE "teachers" ADD CONSTRAINT "FK_4668d4752e6766682d1be0b346f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD CONSTRAINT "FK_91eb3280b50fe17091b191bbd98" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quizzes" ADD CONSTRAINT "FK_2cf4e4b5b533af8dc6b38d4fa9b" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quizzes" ADD CONSTRAINT "FK_d5fc807be6786b51b6d3fa8b5f6" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_a720e260138b64fcff2fca19b2d" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_fcb54da39fa07acef996f75f32d" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_fb3eff90b11bddf7285f9b4e281" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parents" ADD CONSTRAINT "FK_c94c3cea9b43a18c81269ded41d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parent_student" ADD CONSTRAINT "FK_56c93c8885d58f23000148c9b27" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "parent_student" ADD CONSTRAINT "FK_9c2fadef93e1c8a720c428e9969" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent_student" DROP CONSTRAINT "FK_9c2fadef93e1c8a720c428e9969"`);
        await queryRunner.query(`ALTER TABLE "parent_student" DROP CONSTRAINT "FK_56c93c8885d58f23000148c9b27"`);
        await queryRunner.query(`ALTER TABLE "parents" DROP CONSTRAINT "FK_c94c3cea9b43a18c81269ded41d"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_fb3eff90b11bddf7285f9b4e281"`);
        await queryRunner.query(`ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_fcb54da39fa07acef996f75f32d"`);
        await queryRunner.query(`ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_a720e260138b64fcff2fca19b2d"`);
        await queryRunner.query(`ALTER TABLE "quizzes" DROP CONSTRAINT "FK_d5fc807be6786b51b6d3fa8b5f6"`);
        await queryRunner.query(`ALTER TABLE "quizzes" DROP CONSTRAINT "FK_2cf4e4b5b533af8dc6b38d4fa9b"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_91eb3280b50fe17091b191bbd98"`);
        await queryRunner.query(`ALTER TABLE "teachers" DROP CONSTRAINT "FK_4668d4752e6766682d1be0b346f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9c2fadef93e1c8a720c428e996"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_56c93c8885d58f23000148c9b2"`);
        await queryRunner.query(`DROP TABLE "parent_student"`);
        await queryRunner.query(`DROP TABLE "parents"`);
        await queryRunner.query(`DROP TABLE "students"`);
        await queryRunner.query(`DROP TABLE "quiz_attempts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2cf4e4b5b533af8dc6b38d4fa9"`);
        await queryRunner.query(`DROP TABLE "quizzes"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_91eb3280b50fe17091b191bbd9"`);
        await queryRunner.query(`DROP TABLE "lessons"`);
        await queryRunner.query(`DROP TABLE "teachers"`);
    }

}
