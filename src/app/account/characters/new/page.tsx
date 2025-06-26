'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CreateCharacterPage() {
  const { user, token } = useAuth(); // Get the logged-in user and their token
  const router = useRouter(); // For redirecting after success

  // State for our form fields
  const [characterName, setCharacterName] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This function runs when the user clicks the "Create Character" button
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // We need to be logged in and have our user ID to create a character
    if (!token || !user) {
      setError("You must be logged in to create a character.");
      setIsSubmitting(false);
      return;
    }

    try {
      // We call the '/api/characters' endpoint we built in Phase 1
      const res = await fetch('http://localhost:3001/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // We don't actually need this for this route yet, but it's good practice
        },
        body: JSON.stringify({ 
          character_name: characterName, 
          character_class: characterClass,
          user_id: user.userId // We get our own user ID from the logged-in state!
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // If successful, redirect to the new character's profile page
      alert('Character created successfully!');
      router.push(`/characters/${data.id}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800/50 p-8 rounded-lg shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">Create a New Character</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="characterName" className="block text-sm font-medium text-gray-300">Character Name</label>
            <input
              id="characterName"
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label htmlFor="characterClass" className="block text-sm font-medium text-gray-300">Class</label>
            <input
              id="characterClass"
              type="text"
              value={characterClass}
              onChange={(e) => setCharacterClass(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none disabled:bg-gray-500"
          >
            {isSubmitting ? 'Creating...' : 'Create Character'}
          </button>
        </form>
        {error && <p className="mt-4 text-center text-red-400">{error}</p>}
      </div>
    </main>
  );
}