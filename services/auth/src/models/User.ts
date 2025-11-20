import pool from '../config/database';
import bcrypt from 'bcrypt';

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'student' | 'teacher' | 'parent';
  created_at: Date;
}

/**
 * User creation data
 */
export interface CreateUserData {
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'parent';
  firstName: string;
  lastName: string;
}

/**
 * Find user by email
 *
 * @param email - User email address
 * @returns User object or null if not found
 */
export const findByEmail = async (email: string): Promise<User | null> => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as User;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

/**
 * Create a new user with profile and role-specific record
 *
 * This function performs a transaction that:
 * 1. Hashes the password
 * 2. Creates user in users table
 * 3. Creates profile record
 * 4. Creates role-specific record (students/teachers/parents)
 *
 * @param userData - User registration data
 * @returns Created user object (without password_hash)
 */
export const createUser = async (userData: CreateUserData): Promise<Omit<User, 'password_hash'>> => {
  const client = await pool.connect();

  try {
    // Start transaction
    await client.query('BEGIN');

    // 1. Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // 2. Create user in users table
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, email, role, created_at`,
      [userData.email, passwordHash, userData.role]
    );

    const user = userResult.rows[0];

    // 3. Create profile record
    await client.query(
      `INSERT INTO profiles (user_id, first_name, last_name)
       VALUES ($1, $2, $3)`,
      [user.id, userData.firstName, userData.lastName]
    );

    // 4. Create role-specific record
    switch (userData.role) {
      case 'student':
        // Students get default accessibility settings
        await client.query(
          `INSERT INTO students (user_id, accessibility_settings)
           VALUES ($1, $2)`,
          [
            user.id,
            JSON.stringify({
              font_family: 'Arial',
              font_size: 16,
              line_spacing: 1.5,
              letter_spacing: 0,
              text_color: '#000000',
              background_color: '#FFFFFF'
            })
          ]
        );
        break;

      case 'teacher':
        await client.query(
          `INSERT INTO teachers (user_id) VALUES ($1)`,
          [user.id]
        );
        break;

      case 'parent':
        await client.query(
          `INSERT INTO parents (user_id) VALUES ($1)`,
          [user.id]
        );
        break;

      default:
        throw new Error(`Invalid role: ${userData.role}`);
    }

    // Commit transaction
    await client.query('COMMIT');

    // Return user without password_hash
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    };

  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error creating user:', error);
    throw error;
  } finally {
    // Release client back to pool
    client.release();
  }
};

/**
 * Verify password
 *
 * @param plainPassword - Plain text password from user input
 * @param hashedPassword - Hashed password from database
 * @returns True if password matches, false otherwise
 */
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error verifying password:', error);
    throw error;
  }
};
