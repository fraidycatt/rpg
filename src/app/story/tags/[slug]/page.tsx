'use client';

import Link from 'next/link';
// 1. We import 'use' from React
import { useState, useEffect, use } from 'react';

// 2. We receive the full 'props' object
export default function TagPage(props: { params: { slug: string } }) {
  // 3. We use the hook to "unwrap" the params promise/object
  const { slug } = use(props.params);
  
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTopicsByTag = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/v1/story/topics?tag=${slug}`);
        if (!res.ok) throw new Error('Failed to fetch topics');
        const data = await res.json();
        setTopics(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) { // Only fetch if the slug has been resolved
      getTopicsByTag();
    }
  }, [slug]);

  if (isLoading) return <p className="p-24 text-white">Loading topics...</p>;
  if (error) return <p className="p-24 text-red-500">Error: {error}</p>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-5xl">

        {/* This is the new, combined header section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-400">
            Topics in: {slug.replace(/-/g, ' ')}
          </h1>
          {/* Note: We will come back and fix the hardcoded tagId=1 later */}
          <Link href={`/story/new-topic?tagId=1`} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            + Start New Story
          </Link>
        </div>

        {/* This is the container for the list of topics */}
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
          {topics.length > 0 ? (
            <ul className="space-y-2">
              {topics.map((topic: any) => (
                <li key={topic.id}>
                  <Link href={`/story/topics/${topic.id}`} className="block hover:bg-gray-700/50 p-4 rounded-md transition-colors">
                    <p className="text-lg font-semibold text-white">{topic.attributes.title}</p>
                    <p className="text-xs text-gray-400">Replies: {topic.attributes.commentCount - 1}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No topics found in this location yet. Why not start one?</p>
          )}
        </div>
        
      </div>
    </main>
  );
}