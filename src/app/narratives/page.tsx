'use client'; // We are making this a Client Component

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NarrativeCard from '@/components/NarrativeCard'; // We will use the card component

export default function NarrativesBrowsePage() {
  const [narratives, setNarratives] = useState<any[]>([]);
  // We use state to control the sorting, defaulting to 'updated_at_desc'
  const [sortBy, setSortBy] = useState('updated_at_desc');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This useEffect hook fetches the data when the component loads, OR when 'sortBy' changes
  useEffect(() => {
    const fetchNarratives = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:3001/api/v1/narratives?sortBy=${sortBy}`);
        if (!res.ok) throw new Error('Could not fetch narratives.');
        
        const data = await res.json();
        setNarratives(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNarratives();
  }, [sortBy]); // The magic: this hook re-runs whenever the user changes the sort order

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-12 bg-gray-900 text-white">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-purple-400">The Grand Library</h1>
          <p className="text-lg text-gray-300 mt-4">Discover the stories being told in this world.</p>
        </div>

        {/* This is now a controlled component that changes our 'sortBy' state */}
        <div className="flex justify-end mb-6">
          <label htmlFor="sort-by" className="text-sm self-center mr-2">Sort By:</label>
          <select 
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-md px-3 py-1 text-white"
          >
            <option value="updated_at_desc">Most Recent</option>
            <option value="likes_desc">Most Liked</option>
          </select>
        </div>
        
        {isLoading && <p className="text-center">Loading narratives...</p>}
        {error && <p className="text-red-400 text-center">Error: {error}</p>}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {narratives.map((narrative: any) => (
              <NarrativeCard key={narrative.id} narrative={narrative} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}