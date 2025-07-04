// src/app/reset-password/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  // useSearchParams is a hook to read URL query parameters
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // When the component loads, get the token from the URL
  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
        setError("No reset token found. Please request a new link.");
        return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/v1/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'An error occurred.');
      }

      setSuccessMessage('Your password has been reset successfully! You can now log in.');

      // Optional: Redirect to login page after a few seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800/50 p-8 rounded-lg shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">Reset Your Password</h1>
        
        {successMessage ? (
            <div className="text-center">
                <p className="text-green-400">{successMessage}</p>
                <Link href="/login" className="mt-4 inline-block font-medium text-purple-400 hover:text-purple-300">
                    Go to Login &rarr;
                </Link>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="password">New Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white"
                    />
                </div>
                 <div>
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !token}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500"
                >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        )}

        {error && <p className="mt-4 text-center text-red-400">{error}</p>}
      </div>
    </main>
  );
}