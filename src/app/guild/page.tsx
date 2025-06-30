// src/app/guild/page.tsx

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// Interfaces remain the same
interface Discussion {
  id: string;
  attributes: {
    title: string;
    commentCount: number;
    createdAt: string;
  };
}
interface Tag {
    id:string;
    attributes: {
        name: string;
    }
}

export default function GuildPage() {
  const [plottingTag, setPlottingTag] = useState<Tag | null>(null);
  const [plottingThreads, setPlottingThreads] = useState<Discussion[]>([]);
  const [recruitingTag, setRecruitingTag] = useState<Tag | null>(null);
  const [recruitingThreads, setRecruitingThreads] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuildData = async () => {
      try {
        const [plottingRes, recruitingRes] = await Promise.all([
          fetch('http://localhost:3001/api/v1/guild/plotting'),
          fetch('http://localhost:3001/api/v1/guild/recruiting')
        ]);

        if (!plottingRes.ok || !recruitingRes.ok) {
          throw new Error('Failed to fetch threads from the Adventurer\'s Guild.');
        }

        const plottingData = await plottingRes.json();
        const recruitingData = await recruitingRes.json();

        setPlottingTag(plottingData.tag);
        setPlottingThreads(plottingData.threads);
        setRecruitingTag(recruitingData.tag);
        setRecruitingThreads(recruitingData.threads);

      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuildData();
  }, []);

  if (isLoading) return <p className="p-24 text-white">Polishing the bulletin board...</p>;
  if (error) return <p className="p-24 text-red-500">Error: {error}</p>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-12 bg-gray-900 text-white">
      <div className="w-full max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-yellow-300 tracking-wider" style={{ fontFamily: 'serif' }}>
            The Adventurer's Guild
          </h1>
          <p className="text-lg text-gray-400 mt-2">Find your next story, or the companions to tell it with.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Column 1: Fireside Plots */}
          <div className="bg-black/20 p-6 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-orange-300">Fireside Tales</h2>
             {plottingTag && (
                  <Link href={`/story/new-topic?tagId=${plottingTag.id}&context=plotting`} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm">
                    + New Plot
                  </Link>
              )}
            </div>
            <div className="space-y-4">
              {plottingThreads.length > 0 ? plottingThreads.map(thread => (
                // --- FIX: Add prefetch={false} ---
                <Link key={thread.id} href={`/story/topics/${thread.id}`} prefetch={false} className="block p-4 bg-gray-800/60 rounded-md hover:bg-gray-700/80 transition-colors">
                  <p className="font-semibold text-white">{thread.attributes.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {thread.attributes.commentCount - 1} Replies
                  </p>
                </Link>
              )) : (
                <p className="text-gray-500 text-center py-4">No new plots are being discussed.</p>
              )}
            </div>
          </div>

          {/* Column 2: Swords for Coin */}
          <div className="bg-black/20 p-6 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-300">Swords for Coin</h2>
            {recruitingTag && (
                    <Link href={`/story/new-topic?tagId=${recruitingTag.id}&context=recruiting`} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm">
                        + Post Listing
                    </Link>
                )}
            </div>
            <div className="space-y-4">
              {recruitingThreads.length > 0 ? recruitingThreads.map(thread => (
                // --- FIX: Add prefetch={false} ---
                <Link key={thread.id} href={`/story/topics/${thread.id}`} prefetch={false} className="block p-4 bg-gray-800/60 rounded-md hover:bg-gray-700/80 transition-colors">
                  <p className="font-semibold text-white">{thread.attributes.title}</p>
                   <p className="text-xs text-gray-400 mt-1">
                    {thread.attributes.commentCount - 1} Replies
                  </p>
                </Link>
              )) : (
                <p className="text-gray-500 text-center py-4">No adventurers are currently for hire.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}