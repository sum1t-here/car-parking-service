'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SignInPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const searchParams = useSearchParams()
    const error_ = searchParams.get('error')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const res = await signIn('credentials', {
            redirect: true,
            email,
            password,
            callbackUrl: '/user/dashboard', // after login redirect
        })

        if (res?.error) {
            setError('Invalid credentials')
        }
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-lg rounded-xl p-6 w-80"
            >
                <h2 className="text-xl font-bold mb-4 text-black">Sign In</h2>

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="border p-2 w-full mb-2 rounded text-black"
                />

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="border p-2 w-full mb-2 rounded text-black"
                />

                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded w-full"
                >
                    Sign In
                </button>

                <button
                    type="button"
                    onClick={() =>
                        signIn('google', { callbackUrl: '/user/dashboard' })
                    }
                    className="mt-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded w-full"
                >
                    Sign In with Google
                </button>

                {error_ === 'missing-role' && (
                    <p className="text-red-500">Please login again.</p>
                )}
            </form>
        </div>
    )
}
