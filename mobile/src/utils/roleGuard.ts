import { UserRole } from '../types/auth'

/**
 * Check if user has at least one of the required roles
 */
export function hasRole(userRole: UserRole | undefined, requiredRoles: UserRole[]): boolean {
  if (!userRole) return false
  return requiredRoles.includes(userRole)
}

/**
 * Check if user is a Traveler
 */
export function isTraveler(userRole: UserRole | undefined): boolean {
  return userRole === 'traveler'
}

/**
 * Check if user is a Business user
 */
export function isBusiness(userRole: UserRole | undefined): boolean {
  return userRole === 'business'
}

/**
 * Check if user is an Admin
 */
export function isAdmin(userRole: UserRole | undefined): boolean {
  return userRole === 'admin'
}

/**
 * Check if user can create activities (Business or Admin)
 */
export function canCreateActivities(userRole: UserRole | undefined): boolean {
  return isBusiness(userRole) || isAdmin(userRole)
}

/**
 * Check if user can make bookings (Traveler or Admin)
 */
export function canBookActivities(userRole: UserRole | undefined): boolean {
  return isTraveler(userRole) || isAdmin(userRole)
}

/**
 * Check if user can moderate content (Admin only)
 */
export function canModerate(userRole: UserRole | undefined): boolean {
  return isAdmin(userRole)
}

/**
 * Check if user can verify businesses (Admin only)
 */
export function canVerifyBusiness(userRole: UserRole | undefined): boolean {
  return isAdmin(userRole)
}

/**
 * Get human-readable role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleMap: Record<UserRole, string> = {
    traveler: 'Traveler',
    business: 'Business',
    admin: 'Administrator',
  }
  return roleMap[role] || role
}
