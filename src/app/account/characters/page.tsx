'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// Define the shape of a character object for TypeScript
interface Character {
  id: number;
  character_name: string;
  character_class: string;
}

export default function CharacterHubPage() {
  const { user, token } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // This useEffect fetches the user's characters when the page loads
  useEffect(() => {
    if (token) {
      const fetchMyCharacters = async () => {
        try {
          // We call the new secure endpoint we created
          const res = await fetch('http://localhost:3001/api/characters/my-characters', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!res.ok) throw new Error('Failed to fetch your characters.');
          
          const data = await res.json();
          setCharacters(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchMyCharacters();
    } else if (token === null) {
        // If there's no token, we're done loading.
        setIsLoading(false);
    }
  }, [token]);

  if (isLoading) return <p className="p-24 text-white animate-pulse">Summoning your characters...</p>;
  if (!user) return <p className="p-24 text-red-400">Please log in to manage your characters.</p>;

  return (
    <main className="flex justify-center p-8 sm:p-12 bg-gray-900 text-white min-h-screen">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-6 text-purple-400">Your Characters</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Map over the user's characters to create a card for each */}
          {characters.map(char => (
            <div key={char.id} className="bg-gray-800/50 p-4 rounded-lg shadow-lg border border-gray-700 flex flex-col justify-between">
                <div>
                    <h2 className="text-xl font-bold text-purple-300">{char.character_name}</h2>
                    <p className="text-sm text-gray-400">{char.character_class}</p>
                </div>
                <div className="mt-4 flex gap-2">
                    <Link href={`/characters/${char.id}`} className="flex-1 text-center bg-blue-600/50 hover:bg-blue-600 text-white text-xs py-1 px-3 rounded">View Profile</Link>
                    <Link href={`/characters/edit/${char.id}`} className="flex-1 text-center bg-gray-600/50 hover:bg-gray-600 text-white text-xs py-1 px-3 rounded">Edit</Link>
                </div>
            </div>
          ))}

          {/* The "Create New" card is the last item in the grid */}
          <Link href="/characters/new" className="flex items-center justify-center p-4 bg-green-800/20 hover:bg-green-800/40 border-2 border-dashed border-gray-600 hover:border-green-500 rounded-lg transition-colors text-gray-400 hover:text-white">
            <div className="text-center">
              <p className="text-4xl">+</p>
              <p className="font-semibold">Create New Character</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}