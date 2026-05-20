/**
 * User Role Constants
 *
 * Centralized user role definitions used across the application.
 * This ensures consistency in role handling throughout the frontend.
 */

/**
 * User Role Union Type
 * Used for TypeScript type checking
 */
export type UserRole = 'student' | 'teacher' | 'parent';

/**
 * User Role Constants Object
 * Use these constants instead of string literals to avoid typos
 *
 * @example
 * ```typescript
 * if (user.role === USER_ROLES.STUDENT) {
 *   // Handle student logic
 * }
 * ```
 */
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  PARENT: 'parent',
} as const;

/**
 * Array of all valid user roles
 * Useful for iteration, validation, or dropdown options
 */
export const USER_ROLE_VALUES = Object.values(USER_ROLES);

/**
 * Type guard to check if a string is a valid UserRole
 *
 * @example
 * ```typescript
 * if (isValidUserRole(someString)) {
 *   // TypeScript now knows someString is UserRole
 * }
 * ```
 */
export function isValidUserRole(role: string): role is UserRole {
  return USER_ROLE_VALUES.includes(role as UserRole);
}

/**
 * Human-readable role labels for UI display
 */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  teacher: 'Teacher',
  parent: 'Parent',
};
