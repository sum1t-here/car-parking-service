import { PrismaClient } from '@/prisma/generated/prisma';

const prismaClientSingleton = () => {
    return new PrismaClient();
};

declare global {
    var prismaClient: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prismaClient: ReturnType<typeof prismaClientSingleton> =
    globalThis.prismaClient ?? prismaClientSingleton();

export default prismaClient;

if (process.env.NODE_ENV !== 'production')
    globalThis.prismaClient = prismaClient;
