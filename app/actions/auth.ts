'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { hash } from 'bcryptjs'
import { validateEmail, validatePassword, validateName } from '@/lib/validation'

export async function createUser(name: string, email: string, password: string) {
    try {
        // Validate using shared utilities
        const emailValidation = validateEmail(email)
        if (!emailValidation.valid) {
            return { success: false, error: emailValidation.error }
        }

        const passwordValidation = validatePassword(password)
        if (!passwordValidation.valid) {
            return { success: false, error: passwordValidation.error }
        }

        const nameValidation = validateName(name)
        if (!nameValidation.valid) {
            return { success: false, error: nameValidation.error }
        }

        const passwordHash = await hash(password, 12)
        const { data, error } = await supabaseAdmin
            .from('users')
            .insert([
                {
                    name: name.trim(),
                    email: email.toLowerCase().trim(),
                    password_hash: passwordHash,
                },
            ])
            .select()
            .single()
        if (error) {
            if (error.code === '23505') {
                return { success: false, error: 'Email already exists' }
            }
            console.error('Supabase error:', error)
            return { success: false, error: 'Failed to create account. Please try again.' }
        }

        return { success: true, data }
    } catch (err) {
        console.error('Error creating user:', err)
        return { success: false, error: 'An error occurred. Please try again.' }
    }
}
