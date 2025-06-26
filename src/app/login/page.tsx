'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import the router
import { useAuth } from '@/context/AuthContext'; // Import our new auth hook

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth(); // Get the login function from our context
  const router = useRouter(); // Get the router instance

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST', // <-- THIS IS THE FIX
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
});
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Instead of console.log, we now call our global login function
      login(data.token);

      // Redirect the user to the homepage after successful login
      router.push('/');

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800/50 p-8 rounded-lg shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">Log In</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
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
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500"
          >
            Log In
          </button>
        </form>

        {error && <p className="mt-4 text-center text-red-400">{error}</p>}

        <p className="mt-6 text-center text-sm text-gray-400">
          Need an account?{' '}
          <Link href="/register" className="font-medium text-purple-400 hover:text-purple-300">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}