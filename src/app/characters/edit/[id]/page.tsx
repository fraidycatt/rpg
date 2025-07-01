'use client';

import React, { useState, useEffect } from 'react';
import CharacterForm from '@/components/CharacterForm';
import { useAuth } from '@/context/AuthContext';

interface CharacterData {
    character_name: string;
    character_class: string;
    rp_status: number;
    gender: number;
    appearance: string;
    personality: string;
    history: string;
}

export default function EditCharacterPage({ params }: { params: { id: string } }) {
  const { id: characterId } = React.use(params);
  const { user, token } = useAuth(); // We need the token to make an authenticated request

  const [initialData, setInitialData] = useState<Partial<CharacterData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!characterId || !token) return; // Don't fetch if we don't have an ID or a token

    const fetchCharacterData = async () => {
      try {
        // --- THIS IS THE FIX ---
        // We now call our new, secure endpoint and include the Authorization header.
        const res = await fetch(`http://localhost:3001/api/characters/edit-data/${characterId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Could not load character data.');
        }

        const data = await res.json();
        setInitialData(data); 

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacterData();
  }, [characterId, token]); // The effect now re-runs if the token changes

  if (isLoading) return <p className="p-24 text-white animate-pulse">Loading Character Data...</p>;
  if (error) return <p className="p-24 text-red-400">Error: {error}</p>;
  if (!user) return <p className="p-24 text-white">You must be logged in to edit a character.</p>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
        <div className="w-full max-w-2xl bg-gray-800/50 p-8 rounded-lg shadow-2xl border border-gray-700">
            <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">Edit Character</h1>
            
            <CharacterForm 
                isCreating={false} 
                characterId={parseInt(characterId, 10)}
                initialData={initialData} 
            />
        </div>
    </main>
  );
}