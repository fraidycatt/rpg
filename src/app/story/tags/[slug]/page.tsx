'use client';

import Link from 'next/link';
import { useState, useEffect, use } from 'react';

// --- Updated interface to match our enriched API response ---
interface Discussion {
  id: string;
  attributes: {
    title: string;
    commentCount: number;
    createdAt: string;
    lastPostedAt: string;
  };
  creatorName: string;
  lastReplyBy: string;
}

// Helper function to format dates nicely
const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

export default function TagPage(props: { params: { slug: string } }) {
  const { slug } = use(props.params);
  
  const [topics, setTopics] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      const getTopicsByTag = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`http://localhost:3001/api/v1/story/topics?tag=${slug}`);
          if (!res.ok) throw new Error('Failed to fetch topics for this location.');
          const data = await res.json();
          setTopics(data);
        } catch (e: any) {
          setError(e.message);
        } finally {
          setIsLoading(false);
        }
      };
      getTopicsByTag();
    }
  }, [slug]);

  if (isLoading) return <p className="p-24 text-white">Loading topics...</p>;
  if (error) return <p className="p-24 text-red-500">Error: {error}</p>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-400 capitalize">
            Topics in: {slug.replace(/-/g, ' ')}
          </h1>
          <Link href={`/story/new-topic?tagSlug=${slug}`} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            + Start New Story
          </Link>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
          {topics.length > 0 ? (
            // We use a simple div with space-y to stack the topic rows
            <div className="space-y-4">
              {topics.map((topic) => (
                // --- This is the new two-column layout ---
                <Link key={topic.id} href={`/story/topics/${topic.id}`} className="flex justify-between items-start p-4 bg-gray-800/60 rounded-md hover:bg-gray-700/80 transition-colors">
                  {/* Left Side */}
                  <div>
                    <p className="text-lg font-bold text-white">{topic.attributes.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      By: <span className="font-medium text-gray-300">{topic.creatorName}</span>
                    </p>
                    <p className="text-xs text-gray-500">On {formatDateTime(topic.attributes.createdAt)}</p>
                  </div>
                  {/* Right Side */}
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-md font-bold text-white">{topic.attributes.commentCount} Replies</p>
                    <p className="text-xs text-gray-500 mt-1">
                      By: {topic.lastReplyBy}
                    </p>
                    <p className="text-xs text-gray-500">On {formatDateTime(topic.attributes.lastPostedAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No topics found in this location yet. Why not start one?</p>
          )}
        </div>
      </div>
    </main>
  );
}