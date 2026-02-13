'use server'

import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { validateEmail, validatePassword, validateName } from '@/lib/validation'
import { PrismaClientKnownRequestError } from '@/lib/prisma-client/library' // Adjust import based on generation

// Since we generate client to ../lib/prisma-client
// The types should be imported from there.
// However, PrismaClientKnownRequestError is usually exported from @prisma/client/runtime/library or similar.
// But valid import for generated client is usually just the client itself or Prisma namespace.
// Let's import Prisma from the client.

import { Prisma } from '@/lib/prisma-client/client'

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

        const hashedPassword = await hash(password, 12)

        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password_hash: hashedPassword,
            },
        })

        return { success: true, data: user }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { success: false, error: 'Email already exists' }
            }
        }
        console.error('Error creating user:', error)
        return { success: false, error: 'Failed to create account. Please try again.' }
    }
}
