'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// Interfaces for our data
interface Tag {
  id: string;
  attributes: {
    name: string;
    description: string;
    slug: string;
  };
}
interface Genre {
  id: number;
  name: string;
  description: string;
  slug: string;
}

export default function StoryPage() {
  const [locations, setLocations] = useState<Tag[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // --- NEW: State to manage the active view ---
  const [activeView, setActiveView] = useState('location'); // 'location' or 'genre'

  useEffect(() => {
    // We now fetch both locations (tags) and genres at the same time
    const fetchPageData = async () => {
      try {
        const [locationsRes, genresRes] = await Promise.all([
          fetch('http://localhost:3001/api/v1/story/tags'),
          fetch('http://localhost:3001/api/v1/genres') // We use the new genres endpoint
        ]);

        if (!locationsRes.ok || !genresRes.ok) {
          throw new Error('Failed to fetch page data');
        }

        const locationsData = await locationsRes.json();
        const genresData = await genresRes.json();

        setLocations(locationsData);
        setGenres(genresData);

      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, []);

  if (isLoading) return <p className="p-24 text-white">Loading Story Map...</p>;
  if (error) return <p className="p-24 text-red-500">Error: {error}</p>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-5xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-purple-400 tracking-wider">
          Story Map
        </h1>
        <p className="text-lg text-gray-300 mb-8">Where will you begin your adventure?</p>

        {/* --- NEW: The View Toggle Buttons --- */}
        <div className="flex justify-center mb-12 border border-gray-700 rounded-full p-1 max-w-sm mx-auto">
            <button 
                onClick={() => setActiveView('location')}
                className={`w-1/2 py-2 rounded-full font-semibold transition-colors ${activeView === 'location' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
                By Location
            </button>
            <button 
                onClick={() => setActiveView('genre')}
                className={`w-1/2 py-2 rounded-full font-semibold transition-colors ${activeView === 'genre' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
                By Genre
            </button>
        </div>

        {/* --- NEW: Conditional Rendering Logic --- */}
        {activeView === 'location' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((tag) => (
                <Link 
                href={`/story/tags/${tag.attributes.slug}`} 
                key={tag.id}
                className="bg-gray-800/50 p-6 rounded-lg shadow-lg hover:shadow-purple-500/20 border border-gray-700 hover:border-purple-500 transition-all group"
                >
                <h2 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                    {tag.attributes.name}
                </h2>
                <p className="text-gray-400 mt-2 text-sm">
                    {tag.attributes.description}
                </p>
                </Link>
            ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {genres.map((genre) => (
                <Link 
                // Note: The href will need to be adjusted if your genre slugs are different
                href={`/browse/${genre.slug}`} 
                key={genre.id}
                className="bg-gray-800/50 p-6 rounded-lg shadow-lg hover:shadow-yellow-400/20 border border-gray-700 hover:border-yellow-400 transition-all group"
                >
                <h2 className="text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors">
                    {genre.name}
                </h2>
                <p className="text-gray-400 mt-2 text-sm">
                    {genre.description}
                </p>
                </Link>
            ))}
            </div>
        )}

      </div>
    </main>
  );
}