
import { PrismaClient } from '@/lib/prisma-client';

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$connect();
        console.log('Connection successful');
    } catch (error) {
        console.error('Connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
