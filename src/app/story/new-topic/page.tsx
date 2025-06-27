'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CreateTopicPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [myCharacters, setMyCharacters] = useState<any[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [allBeats, setAllBeats] = useState<StoryBeat[]>([]);
  const [selectedBeatIds, setSelectedBeatIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the tag ID from the URL query parameter (?tagId=...)
  const tagId = searchParams.get('tagId');

  // Fetch the user's characters for the dropdown
  useEffect(() => {
    if (user) {
      const fetchMyCharacters = async () => {
        const res = await fetch(`http://localhost:3001/api/v1/profiles/${user.username}`);
        const data = await res.json();
        setMyCharacters(data.characters);
      };
      fetchMyCharacters();
    }
  }, [user]);

    useEffect(() => {
    const fetchBeats = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/v1/discovery/beats');
            if (!res.ok) throw new Error('Could not load story beats');
            const data = await res.json();
            setAllBeats(data);
        } catch (err: any) {
            setError(err.message);
        }
    }
    fetchBeats();
  }, []);

    const handleBeatChange = (beatId: string) => {
    // Create a new Set from the current state to ensure we trigger a re-render
    const newSelection = new Set(selectedBeatIds);
    if (newSelection.has(beatId)) {
      newSelection.delete(beatId);
    } else {
      newSelection.add(beatId);
    }
    setSelectedBeatIds(newSelection);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      // Step 1: Create the topic in Flarum (this part is the same)
      const res = await fetch('http://localhost:3001/api/v1/story/topics/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, content, characterId: selectedCharacterId, tagId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create topic.');
      
      const newTopicId = data.topicId;

      // --- START: Step 2: Tag the new topic with our custom beats ---
      // We only run this if beats were actually selected
      if (selectedBeatIds.size > 0) {
        await fetch('http://localhost:3001/api/v1/discovery/tag-topic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            // Convert the Set of IDs to an array for the JSON payload
            body: JSON.stringify({ discussionId: newTopicId, beatIds: Array.from(selectedBeatIds) }),
        });
        // We don't need to check the response here for now, but in a real app you might.
      }
      // --- END: Step 2 ---

      // If successful, redirect to the new topic page!
      router.push(`/story/topics/${newTopicId}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <p className="p-24 text-white">Please log in to create a topic.</p>;

  return (
    <main className="flex justify-center p-8 sm:p-12 bg-gray-900 text-white min-h-screen">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-purple-400">Start a New Story</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800/50 p-6 rounded-lg">
          <div>
          <label htmlFor="character-select" className="block text-sm font-medium text-gray-300">Post as Character:</label>
          <select
            id="character-select"
            value={selectedCharacterId}
            onChange={(e) => setSelectedCharacterId(e.target.value)}
            className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2"
            required
          >
            <option value="" disabled>-- Select Your Character --</option>
            {myCharacters.map(char => (
              <option key={char.id} value={char.id}>{char.character_name}</option>
            ))}
          </select>
        </div>
        <div>
  <label htmlFor="topic-title" className="block text-sm font-medium text-gray-300">Topic Title</label>
  <input
    id="topic-title"
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    required
    className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
    placeholder="What is your story called?"
  />
</div>
        <div>
          <label htmlFor="reply-content" className="block text-sm font-medium text-gray-300">Your Post:</label>
          <textarea
            id="reply-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 p-2 bg-gray-900 border border-gray-600 rounded-md text-white"
            placeholder="Write your story..."
            disabled={isSubmitting}
            required
          />
        </div>
        <div>
                <label className="block text-sm font-medium text-gray-300">Story Beats (Genres):</label>
                <div className="mt-2 p-4 border border-gray-600 rounded-md grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {allBeats.map((beat) => (
                        <div key={beat.id} className="flex items-center">
                            <input
                                id={`beat-${beat.id}`}
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-500 text-purple-600 focus:ring-purple-500"
                                onChange={() => handleBeatChange(beat.id)}
                                // The checkbox is checked if its ID is in our Set of selected IDs
                                checked={selectedBeatIds.has(beat.id)}
                            />
                            <label htmlFor={`beat-${beat.id}`} className="ml-3 text-sm text-gray-200">
                                {beat.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
          <button type="submit" 
          className="py-2 px-6 border border-transparent rounded-md shadow-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500"
          disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Topic'}
          </button>
          {error && <p className="text-red-400 mt-4">{error}</p>}
        </form>
      </div>
    </main>
  );
}