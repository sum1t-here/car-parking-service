import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prismaClient from './prisma';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
    },
    providers: [
        CredentialsProvider({
            name: 'Email and Password',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email',
                    placeholder: 'example@example.com',
                },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Missing email or password');
                }

                try {
                    const user = await prismaClient?.user.findUnique({
                        where: {
                            email: credentials.email,
                        },
                    });

                    if (!user) {
                        throw new Error('Invalid Credentials');
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        throw new Error('Invalid Credentials');
                    }

                    return {
                        id: user.id.toString(),
                        email: user.email,
                        username: user.username,
                        role: user.role,
                    };
                } catch (error) {
                    console.error('Authentication error', error);
                    throw new Error('Authentication failed');
                }
            },
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                const existingUser = await prismaClient.user.findUnique({
                    where: { email: user.email! },
                });

                if (!existingUser) {
                    await prismaClient.user.create({
                        data: {
                            email: user.email!,
                            username: user.email!,
                            role: 'USER',
                            password: '',
                        },
                    });
                }

                if (existingUser) {
                    user.id = existingUser!.id.toString();
                    user.role = existingUser!.role;
                }
            }
            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }

            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string; // Forward custom fields
            }
            return session;
        },
    },
    pages: {
        signIn: '/user/signin', // Custom sign-in page
    },
    secret: process.env.NEXTAUTH_SECRET, // Required for production
};

declare module 'next-auth' {
    interface User {
        id: string;
        email: string;
        username?: string;
        role: string;
    }

    interface Session {
        user: {
            id: string;
            email: string;
            username?: string;
            role?: string;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        email: string;
        username?: string;
        role?: string;
    }
}
