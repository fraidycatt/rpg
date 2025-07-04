// src/app/forgot-password/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/v1/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Even on failure, we might want to show a generic message for security
        // but for debugging, we can show the real error.
        throw new Error(data.message || 'An error occurred.');
      }

      // We always show this generic success message to prevent email enumeration.
      setSuccessMessage('If an account with that email exists, a password reset link has been sent.');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800/50 p-8 rounded-lg shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">Forgot Password</h1>
        
        {/* If the form has been submitted successfully, show the message. Otherwise, show the form. */}
        {successMessage ? (
            <p className="text-center text-green-400">{successMessage}</p>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-sm text-gray-400 text-center">
                    Enter the email address associated with your account, and we'll send you a link to reset your password.
                </p>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                    <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:bg-gray-500"
                >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
        )}

        {error && <p className="mt-4 text-center text-red-400">{error}</p>}

        <p className="mt-6 text-center text-sm text-gray-400">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300">
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
}