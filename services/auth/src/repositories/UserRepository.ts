import { AppDataSource } from '../config/typeorm.config';
import { User, UserRole } from '../entities/User.entity';
import { Profile } from '../entities/Profile.entity';
import { Student } from '../entities/Student.entity';
import { Teacher } from '../entities/Teacher.entity';
import { Parent } from '../entities/Parent.entity';

export const UserRepository = AppDataSource.getRepository(User).extend({
  /**
   * Find user by email with profile
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({
      where: { email },
      relations: ['profile']
    });
  },

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await this.count({ where: { email } });
    return count > 0;
  },

  /**
   * Create user with profile and role-specific record
   */
  async createUserWithProfile(
    email: string,
    password: string,
    role: UserRole,
    firstName: string,
    lastName: string
  ): Promise<User> {
    // Use transaction to ensure all records are created together
    return await AppDataSource.manager.transaction(async (manager) => {
      // 1. Create user
      const user = manager.create(User, {
        email,
        passwordHash: password, // Will be hashed by @BeforeInsert hook
        role
      });
      await manager.save(user);

      // 2. Create profile
      const profile = manager.create(Profile, {
        userId: user.id,
        firstName,
        lastName
      });
      await manager.save(profile);

      // 3. Create role-specific record
      if (role === UserRole.STUDENT) {
        const student = manager.create(Student, {
          userId: user.id,
          accessibilitySettings: {
            font_family: 'Arial',
            font_size: 16,
            line_spacing: 1.5,
            letter_spacing: 0,
            text_color: '#000000',
            background_color: '#FFFFFF'
          }
        });
        await manager.save(Student, student);
      } else if (role === UserRole.TEACHER) {
        const teacher = manager.create(Teacher, {
          userId: user.id
        });
        await manager.save(Teacher, teacher);
      } else if (role === UserRole.PARENT) {
        const parent = manager.create(Parent, {
          userId: user.id
        });
        await manager.save(Parent, parent);
      }

      // Return user with profile loaded
      const createdUser = await manager.findOne(User, {
        where: { id: user.id },
        relations: ['profile']
      });

      if (!createdUser) {
        throw new Error('Failed to create user');
      }

      return createdUser;
    });
  }
});
