'use client';

import Link from 'next/link';
import { useState, useEffect, use } from 'react';

// --- UPDATED INTERFACE ---
// The data structure now correctly reflects the Flarum API response.
interface Topic {
  id: string;
  attributes: {
    title: string;
    comment_count: number;
  };
}

export default function BrowseByBeatPage(props: { params: { slug: string } }) {
  const { slug } = use(props.params);
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const getTopicsByBeat = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/v1/discovery/topics?beat=${slug}`);
        if (!res.ok) throw new Error('Failed to fetch topics for this genre');
        
        const data = await res.json();
        setTopics(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    getTopicsByBeat();
  }, [slug]);

  if (isLoading) return <p className="p-24 text-white">Loading topics...</p>;
  if (error) return <p className="p-24 text-red-500">Error: {error}</p>;

  const beatTitle = slug ? slug.replace(/-/g, ' ') : '';

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-5xl">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-400 capitalize">
            Stories: {beatTitle}
          </h1>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
          {topics.length > 0 ? (
            <ul className="space-y-2">
              {/* --- UPDATED JSX --- */}
              {/* We now correctly use topic.id for the key and topic.attributes for the data. */}
              {topics.map((topic) => (
                <li key={topic.id}>
                  <Link href={`/story/topics/${topic.id}`} className="block hover:bg-gray-700/50 p-4 rounded-md transition-colors">
                    <p className="text-lg font-semibold text-white">{topic.attributes.title}</p>
                    <p className="text-xs text-gray-400">Replies: {topic.attributes.comment_count > 0 ? topic.attributes.comment_count - 1 : 0}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No topics have been tagged with this genre yet.</p>
          )}
        </div>
        
      </div>
    </main>
  );
}