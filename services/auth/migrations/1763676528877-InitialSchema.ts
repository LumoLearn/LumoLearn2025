import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1763676528877 implements MigrationInterface {
    name = 'InitialSchema1763676528877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Create tables
        await queryRunner.query(`CREATE TABLE "profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "first_name" character varying(100), "last_name" character varying(100), CONSTRAINT "REL_9e432b7df0d182f8d292902d1a" UNIQUE ("user_id"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "role" character varying(50) NOT NULL DEFAULT 'student', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // Seed test users (password for all: Test1234!)
        // Password hash: $2b$10$PYyQaPq9W3x/Q9yHBd01MufwXiYrJH7DOsDpN29OE5B/sD9yeqjN6
        await queryRunner.query(`
          INSERT INTO users (id, email, password_hash, role, created_at)
          VALUES
            ('a1111111-1111-1111-1111-111111111111', 'student@test.com', '$2b$10$PYyQaPq9W3x/Q9yHBd01MufwXiYrJH7DOsDpN29OE5B/sD9yeqjN6', 'student', NOW()),
            ('a2222222-2222-2222-2222-222222222222', 'teacher@test.com', '$2b$10$PYyQaPq9W3x/Q9yHBd01MufwXiYrJH7DOsDpN29OE5B/sD9yeqjN6', 'teacher', NOW()),
            ('a3333333-3333-3333-3333-333333333333', 'parent@test.com', '$2b$10$PYyQaPq9W3x/Q9yHBd01MufwXiYrJH7DOsDpN29OE5B/sD9yeqjN6', 'parent', NOW())
          ON CONFLICT (email) DO NOTHING
        `);

        // Seed test profiles
        await queryRunner.query(`
          INSERT INTO profiles (user_id, first_name, last_name)
          VALUES
            ('a1111111-1111-1111-1111-111111111111', 'Test', 'Student'),
            ('a2222222-2222-2222-2222-222222222222', 'Test', 'Teacher'),
            ('a3333333-3333-3333-3333-333333333333', 'Test', 'Parent')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "profiles"`);
    }

}
