'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ForumsPage() {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
    const getForumTags = async () => {
      try {
        // This now calls the correct backend endpoint
        const internalApiUrl = `http://localhost:3001/api/v1/story/tags`;
        const res = await fetch(internalApiUrl);
        if (!res.ok) throw new Error('Failed to fetch story locations');
        const data = await res.json();
        setTags(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    getForumTags();
  }, []);// Empty array means this runs once on load

  if (isLoading) return <p className="p-24 text-white">Loading Story Map...</p>;
  if (error) return <p className="p-24 text-red-500">Error: {error}</p>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-5xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-purple-400 tracking-wider">
          Story Map
        </h1>
        <p className="text-lg text-gray-300 mb-12">Where will you begin your adventure?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags.map((tag: any) => (
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
      </div>
    </main>
  );
}
