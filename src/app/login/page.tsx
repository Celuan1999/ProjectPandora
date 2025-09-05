'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Button, { ColorTypes } from '../components/ui/button'

import { createClient } from '@/app/utils/supabase/component'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function logIn() {
    setLoading(true)
    setError('')
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      console.error(error)
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  async function signUp() {
    setLoading(true)
    setError('')
    
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      console.error(error)
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-var(--navbar-height))] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={logIn}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            <Button
              color={ColorTypes.secondary}
              onClick={signUp}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4"
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 