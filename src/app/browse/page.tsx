'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// Define the shape of a genre object for TypeScript
interface Genre {
  id: string;
  attributes: {
    name: string;
    description: string;
    slug: string;
    color: string;
  };
}

export default function BrowsePage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getGenres = async () => {
      try {
        // We call the new backend endpoint we created
        const res = await fetch(`http://localhost:3001/api/v1/discovery/genres`);
        if (!res.ok) throw new Error('Failed to fetch story genres');
        
        const data = await res.json();
        setGenres(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    getGenres();
  }, []); // Empty array means this runs once on load

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
          {genres.map((genre) => (
            <Link 
              href={`/browse/${genre.attributes.slug}`} 
              key={genre.id}
              className="bg-gray-800/50 p-6 rounded-lg shadow-lg hover:shadow-purple-500/20 border border-gray-700 hover:border-purple-500 transition-all group"
              // We can use the color from Flarum to style the card!
              style={{ borderTopColor: genre.attributes.color }}
            >
              <h2 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                {genre.attributes.name}
              </h2>
              <p className="text-gray-400 mt-2 text-sm">
                {genre.attributes.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}