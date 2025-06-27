'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// Define the shape of a Story Beat object for TypeScript
interface StoryBeat {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

export default function BrowsePage() {
  const [beats, setBeats] = useState<StoryBeat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getStoryBeats = async () => {
      try {
        // We call the new backend endpoint we created
        const res = await fetch(`http://localhost:3001/api/v1/discovery/beats`);
        if (!res.ok) throw new Error('Failed to fetch story beats');
        
        const data = await res.json();
        setBeats(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    getStoryBeats();
  }, []); // The empty array ensures this runs once when the component mounts

  if (isLoading) return <p className="p-24 text-white">Loading Story Beats...</p>;
  if (error) return <p className="p-24 text-red-500">Error: {error}</p>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-5xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-purple-400 tracking-wider">
          Browse by Genre
        </h1>
        <p className="text-lg text-gray-300 mb-12">What kind of story are you in the mood for?</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beats.map((beat) => (
            <Link 
              href={`/browse/${beat.slug}`} 
              key={beat.id}
              className="bg-gray-800/50 p-6 rounded-lg shadow-lg hover:shadow-purple-500/20 border border-gray-700 hover:border-purple-500 transition-all group"
              // Use the color from the database to style the card's top border
              style={{ borderTopColor: beat.color || '#6B7280' }}
            >
              <h2 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                {beat.name}
              </h2>
              <p className="text-gray-400 mt-2 text-sm">
                {beat.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}