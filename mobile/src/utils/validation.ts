export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function validateFullName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: 'Full name must be at least 2 characters' }
  }
  return { valid: true }
}

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone) {
    return { valid: true } // Optional field
  }
  const phoneRegex = /^[\d\s+\-()]+$/
  if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 7) {
    return { valid: false, error: 'Invalid phone number' }
  }
  return { valid: true }
}

export function validatePriceRange(
  priceMin: number | undefined,
  priceMax: number | undefined
): { valid: boolean; error?: string } {
  if (priceMin !== undefined && priceMax !== undefined && priceMin > priceMax) {
    return { valid: false, error: 'Minimum price must be less than maximum price' }
  }
  return { valid: true }
}

export function validateNumberInput(
  value: string,
  min?: number,
  max?: number
): { valid: boolean; error?: string } {
  const num = parseInt(value, 10)

  if (isNaN(num)) {
    return { valid: false, error: 'Must be a number' }
  }

  if (min !== undefined && num < min) {
    return { valid: false, error: `Must be at least ${min}` }
  }

  if (max !== undefined && num > max) {
    return { valid: false, error: `Must not exceed ${max}` }
  }

  return { valid: true }
}

export interface ValidationErrors {
  [field: string]: string | undefined
}

export function clearFieldError(errors: ValidationErrors, field: string): ValidationErrors {
  const newErrors = { ...errors }
  delete newErrors[field]
  return newErrors
}

export function setFieldError(errors: ValidationErrors, field: string, error: string): ValidationErrors {
  return { ...errors, [field]: error }
}
