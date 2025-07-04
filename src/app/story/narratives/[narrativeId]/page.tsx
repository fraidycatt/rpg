'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';

interface CastMember {
    id: number;
    character_name: string;
}
interface Chapter {
    join_id: number;
    chapter_order: number;
    title: string;
    flarum_topic_id: string;
    logged_relationship_id: number | null;
    character_one_name: string;
    character_two_name: string;
    new_relationship_status: string;
    relationship_change_note: string;
}
// --- NEW: Interface for our cast member data ---
interface CastMember {
    id: number;
    character_name: string;
    character_class: string;
    user_id: number;
}

export default function NarrativeReaderPage({ params }: { params: { narrativeId: string } }) {
  // --- This is the correct way to get params in a Client Component ---
  const { narrativeId } = use(params);

  // State for all our data
  const [narrative, setNarrative] = useState<Narrative | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // A single, stable function to fetch all page data
  const fetchPageData = useCallback(async () => {
    if (!narrativeId) return;

    try {
      // Fetch both the narrative details and the cast list at the same time
      const [narrativeRes, castRes] = await Promise.all([
        fetch(`http://localhost:3001/api/v1/narratives/${narrativeId}`),
        fetch(`http://localhost:3001/api/v1/narratives/${narrativeId}/cast`)
      ]);

      if (!narrativeRes.ok) throw new Error('Failed to fetch narrative data.');
      if (!castRes.ok) throw new Error('Failed to fetch cast list.');

      const narrativeData = await narrativeRes.json();
      const castData = await castRes.json();

      setNarrative(narrativeData.narrative);
      setChapters(narrativeData.chapters);
      setCast(castData);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [narrativeId]);

  // useEffect to run our fetch function once the component mounts
  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  if (isLoading) return <main className="p-24 text-white">Loading Narrative...</main>;
  if (error) return <main className="p-24 text-red-500">Error: {error}</main>;
  if (!narrative) return <main className="p-24 text-white">Could not load narrative.</main>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-16 bg-gray-900 text-white">
      <div className="w-full max-w-4xl">

        {/* Narrative Header (unchanged) */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-purple-400 tracking-tight">{narrative.title}</h1>
          <p className="text-lg text-gray-300 mt-4 max-w-2xl mx-auto">{narrative.summary}</p>
        </div>
        
        {/* --- NEW: Cast List Section --- */}
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700 mb-8">
            <h2 className="text-2xl font-semibold border-b border-gray-600 pb-3 mb-4">Cast of Characters</h2>
            {cast.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                    {cast.map((member) => (
                        <Link key={member.id} href={`/characters/${member.id}`} className="text-purple-300 hover:text-white hover:underline">
                            {member.character_name}
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">No characters have participated in this narrative yet.</p>
            )}
        </div>


        {/* Table of Contents (unchanged) */}
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-2xl font-semibold border-b border-gray-600 pb-3 mb-4">Chapters</h2>
          <ul className="space-y-1">
            {chapters.map((chapter: any) => (
              <li key={chapter.join_id} className="border-b border-gray-700/50 last:border-b-0 py-2">
                <Link 
                  href={`/story/topics/${chapter.flarum_topic_id}`} 
                  className="flex justify-between items-center p-2 rounded-md hover:bg-purple-500/10 transition-colors"
                >
                  <span className="font-semibold">Chapter {chapter.chapter_order}: {chapter.title}</span>
                  <span className="text-xs text-gray-400">Read &rarr;</span>
                </Link>

                {chapter.logged_relationship_id && (
                   <div className="text-sm italic text-purple-300 mt-2 pl-2">
                    <p>
                        <strong>Moment:</strong> {chapter.character_one_name} now sees {chapter.character_two_name} as <strong>{chapter.new_relationship_status}</strong>.
                    </p>
                    {chapter.relationship_change_note && (
                        <p className="mt-1">
                            &ldquo;{chapter.relationship_change_note}&rdquo;
                        </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          {chapters.length === 0 && (
            <p className="text-gray-400">This narrative has no chapters yet.</p>
          )}
        </div>

      </div>
    </main>
  );
}