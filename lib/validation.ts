import { z } from 'zod'

// Shared validation utilities used by both client and server

export interface PasswordStrength {
    hasMinLength: boolean
    hasLowercase: boolean
    hasUppercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
}

export interface ValidationResult {
    valid: boolean
    error?: string
}

// Email validation
export function validateEmail(email: string): ValidationResult {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Invalid email format' }
    }

    // Convert to lowercase for consistency
    const lowerEmail = email.toLowerCase()

    // Blocked disposable/temporary email domains
    const blockedDomains = [
        'tempmail.com', 'throwaway.com', '10minutemail.com',
        'guerrillamail.com', 'mailinator.com', 'trashmail.com'
    ]

    const domain = lowerEmail.split('@')[1]
    if (blockedDomains.includes(domain)) {
        return { valid: false, error: 'Temporary email addresses are not allowed' }
    }

    return { valid: true }
}

// Password validation - returns detailed strength info
export function checkPasswordStrength(password: string): PasswordStrength {
    return {
        hasMinLength: password.length >= 8,
        hasLowercase: /[a-z]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    }
}

// Password validation - returns validation result
export function validatePassword(password: string): ValidationResult {
    const strength = checkPasswordStrength(password)

    if (!strength.hasMinLength) {
        return { valid: false, error: 'Password must be at least 8 characters long' }
    }

    if (!strength.hasLowercase) {
        return { valid: false, error: 'Password must contain at least one lowercase letter' }
    }

    if (!strength.hasUppercase) {
        return { valid: false, error: 'Password must contain at least one uppercase letter' }
    }

    if (!strength.hasNumber) {
        return { valid: false, error: 'Password must contain at least one number' }
    }

    if (!strength.hasSpecialChar) {
        return { valid: false, error: 'Password must contain at least one special character' }
    }

    return { valid: true }
}

// Check if password strength is complete
export function isPasswordStrong(strength: PasswordStrength): boolean {
    return strength.hasMinLength &&
        strength.hasLowercase &&
        strength.hasUppercase &&
        strength.hasNumber &&
        strength.hasSpecialChar
}

// Name validation
export function validateName(name: string): ValidationResult {
    if (!name || name.trim().length < 2) {
        return { valid: false, error: 'Name must be at least 2 characters long' }
    }
    return { valid: true }
}

export const createPostSchema = z.object({
    caption: z.string().optional(),
    imageUrl: z.string().url('Invalid image URL'),
    scheduledAt: z
        .string()
        .datetime({ message: 'scheduledAt must be a valid ISO 8601 datetime string' })
        .refine(
            (val) => new Date(val) > new Date(),
            { message: 'scheduledAt must be a date in the future' }
        )
        .optional(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
