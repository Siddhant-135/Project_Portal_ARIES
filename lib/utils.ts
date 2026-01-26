export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Role hierarchy: Admin ⊃ ARIES_Member ⊃ Student
 * Higher roles can do everything lower roles can do
 */
export type UserRole = 'Student' | 'ARIES_Member' | 'Admin';

const ROLE_LEVELS: Record<UserRole, number> = {
  'Student': 1,
  'ARIES_Member': 2,
  'Admin': 3,
};

/**
 * Check if a user's role has at least the required role level
 * e.g., hasRoleLevel('Admin', 'Student') returns true (Admin can do Student things)
 * e.g., hasRoleLevel('Student', 'ARIES_Member') returns false (Student cannot do ARIES_Member things)
 */
export function hasRoleLevel(userRole: UserRole | string | null | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  const userLevel = ROLE_LEVELS[userRole as UserRole] || 0;
  const requiredLevel = ROLE_LEVELS[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Check if user can create projects (ARIES_Member or Admin)
 */
export function canCreateProjects(role: UserRole | string | null | undefined): boolean {
  return hasRoleLevel(role, 'ARIES_Member');
}

/**
 * Check if user can access admin panel (Admin only)
 */
export function canAccessAdmin(role: UserRole | string | null | undefined): boolean {
  return hasRoleLevel(role, 'Admin');
}

export function mapSupabaseError(message?: string): string {
  if (!message) {
    return 'Something went wrong. Please try again.';
  }

  const normalized = message.toLowerCase();

  if (normalized.includes('row-level security')) {
    return 'You do not have permission to perform this action.';
  }
  if (normalized.includes('violates check constraint')) {
    return 'Please review your input and try again.';
  }
  if (normalized.includes('duplicate key') || normalized.includes('unique constraint')) {
    return 'This already exists. Please use a different value.';
  }
  if (normalized.includes('foreign key')) {
    return 'This item is linked to another record. Please refresh and try again.';
  }
  if (normalized.includes('permission denied')) {
    return 'You do not have permission to perform this action.';
  }

  return 'Unexpected error. Please try again.';
}
