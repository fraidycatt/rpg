'use client'; // This must be a Client Component to handle user interaction

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  // We use 'useState' to keep track of what the user is typing
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State for handling messages back from the API
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // This function runs when the user clicks the "Register" button
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the default browser form submission
    setError(null); // Reset errors on a new submission
    setSuccess(null);

    try {
      // We call our backend's register endpoint
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If the server responded with an error, display it
        throw new Error(data.message || 'Something went wrong');
      }

      // If successful, show a success message
      setSuccess('Registration successful! You can now log in.');

    } catch (err: any) {
      // If there was a network error or an error from our API, display it
      setError(err.message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800/50 p-8 rounded-lg shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">Create Your Account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
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
            Register
          </button>
        </form>

        {/* Display success or error messages */}
        {success && <p className="mt-4 text-center text-green-400">{success}</p>}
        {error && <p className="mt-4 text-center text-red-400">{error}</p>}
        
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}