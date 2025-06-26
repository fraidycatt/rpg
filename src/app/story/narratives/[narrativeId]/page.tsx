import Link from 'next/link';

// This async function fetches all the data for our narrative page from our backend
async function getNarrativeData(narrativeId: string) {
  try {
    const res = await fetch(`http://localhost:3001/api/v1/narratives/${narrativeId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch narrative');
    return res.json();
  } catch (error) {
    console.error(error);
    return null; // Return null on error
  }
}

export default async function NarrativeReaderPage({ params }: { params: { narrativeId: string } }) {
  const narrativeData = await getNarrativeData(params.narrativeId);

  if (!narrativeData) {
    return <main className="p-24 text-white">Could not load narrative.</main>;
  }

  const { narrative, chapters } = narrativeData;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-16 bg-gray-900 text-white">
      <div className="w-full max-w-4xl">

        {/* Narrative Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-purple-400 tracking-tight">{narrative.title}</h1>
          {/* We can add the author's name here later with another DB join! */}
          <p className="text-lg text-gray-300 mt-4 max-w-2xl mx-auto">{narrative.summary}</p>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-2xl font-semibold border-b border-gray-600 pb-3 mb-4">Chapters</h2>
          <ul className="space-y-1">
            {chapters.map((chapter: any) => (
              <li key={chapter.join_id}>
                <Link 
                  href={`/story/topics/${chapter.flarum_topic_id}`} 
                  className="flex justify-between items-center p-4 rounded-md hover:bg-purple-500/10 transition-colors"
                >
                  <span className="font-semibold">Chapter {chapter.chapter_order}: {chapter.title}</span>
                  <span className="text-xs text-gray-400">Read &rarr;</span>
                </Link>

                {chapter.logged_relationship_id && (
                   <div className="text-sm italic text-purple-300 mt-3 pt-3 border-t border-gray-700/50">
                    <p>
                        <strong>Relationship Moment:</strong> {chapter.character_one_name} now sees {chapter.character_two_name} as <strong>{chapter.new_relationship_status}</strong>.
                    </p>
                    {chapter.relationship_change_note && (
                        <p className="mt-1">
                            <strong>Reason:</strong> {chapter.relationship_change_note}
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