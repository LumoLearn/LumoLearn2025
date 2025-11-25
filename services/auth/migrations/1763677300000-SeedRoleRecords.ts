import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedRoleRecords1763677300000 implements MigrationInterface {
    name = 'SeedRoleRecords1763677300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Seed student record for student@test.com
        await queryRunner.query(`
          INSERT INTO students (user_id, accessibility_settings)
          VALUES
            ('a1111111-1111-1111-1111-111111111111', '{"font_family":"Arial","font_size":16,"line_spacing":1.5,"letter_spacing":0,"text_color":"#000000","background_color":"#FFFFFF"}')
          ON CONFLICT (user_id) DO NOTHING
        `);

        // Seed teacher record for teacher@test.com
        await queryRunner.query(`
          INSERT INTO teachers (user_id)
          VALUES
            ('a2222222-2222-2222-2222-222222222222')
          ON CONFLICT (user_id) DO NOTHING
        `);

        // Seed parent record for parent@test.com
        await queryRunner.query(`
          INSERT INTO parents (user_id)
          VALUES
            ('a3333333-3333-3333-3333-333333333333')
          ON CONFLICT (user_id) DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove seeded role records
        await queryRunner.query(`DELETE FROM students WHERE user_id = 'a1111111-1111-1111-1111-111111111111'`);
        await queryRunner.query(`DELETE FROM teachers WHERE user_id = 'a2222222-2222-2222-2222-222222222222'`);
        await queryRunner.query(`DELETE FROM parents WHERE user_id = 'a3333333-3333-3333-3333-333333333333'`);
    }
}
