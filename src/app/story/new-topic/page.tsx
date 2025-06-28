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
  const [selectedAuthor, setSelectedAuthor] = useState(''); 
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [allBeats, setAllBeats] = useState<StoryBeat[]>([]);
  const [selectedBeatIds, setSelectedBeatIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the tag ID from the URL query parameter (?tagId=...)
  const tagId = searchParams.get('tagId');
  const context = searchParams.get('context');
  const isOocTopic = context === 'plotting' || context === 'recruiting';

  // --- We create an object to hold our conditional text ---
  const pageText = {
    title: 'Start a New Story',
    titlePlaceholder: 'What is your story called?',
    contentPlaceholder: 'Write your story...',
    submitButton: 'Create Story'
  };

  if (context === 'plotting') {
    pageText.title = 'Post a New Plot';
    pageText.titlePlaceholder = 'What is your plot hook?';
    pageText.contentPlaceholder = 'Describe the plot, the tone, and what you\'re looking for...';
    pageText.submitButton = 'Post Plot';
  } else if (context === 'recruiting') {
    pageText.title = 'Create a New Listing';
    pageText.titlePlaceholder = 'What kind of character are you looking for?';
    pageText.contentPlaceholder = 'Describe the role, connections, and any requirements...';
    pageText.submitButton = 'Post Listing';
  }

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

  // Fetch the user's characters (this is still needed for the dropdown)
  useEffect(() => {
    if (user) {
      const fetchMyCharacters = async () => {
        const res = await fetch(`http://localhost:3001/api/v1/profiles/${user.username}`);
        const data = await res.json();
        setMyCharacters(data.characters);
        // If it's an OOC topic, default to posting as the user
        if (isOocTopic) {
            setSelectedAuthor('user');
        }
      };
      fetchMyCharacters();
    }
  }, [user, isOocTopic]);

  // Fetch all available story beats
  useEffect(() => {
    const fetchBeats = async () => {
        // ... (this useEffect is correct and does not need to change)
    };
    fetchBeats();
  }, []);

  const handleBeatChange = (beatId: string) => {
    // ... (this handler is correct and does not need to change)
  };

  // --- MODIFIED SUBMIT HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      // Determine if we are posting as a user or a character
      const characterId = selectedAuthor !== 'user' ? selectedAuthor : null;

      // The backend will now handle the case where characterId is null
      const res = await fetch('http://localhost:3001/api/v1/story/topics/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, content, characterId, tagId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create topic.');
      
      const newTopicId = data.topicId;

      // Only try to tag the topic if it's NOT an OOC topic
      if (!isOocTopic && selectedBeatIds.size > 0) {
        await fetch('http://localhost:3001/api/v1/discovery/tag-topic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ discussionId: newTopicId, beatIds: Array.from(selectedBeatIds) }),
        });
      }

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
        <h1 className="text-3xl font-bold mb-6 text-purple-400">{pageText.title}</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800/50 p-6 rounded-lg">
          <div>
              <label htmlFor="author-select" className="block text-sm font-medium text-gray-300">Post as:</label>
              <select id="author-select" value={selectedAuthor} onChange={(e) => setSelectedAuthor(e.target.value)} className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2" required>
                <option value="" disabled>-- Select an Author --</option>
                {/* Conditionally render the "Post as User" option */}
                {isOocTopic && <option value="user">{user.username} (You)</option>}
                {!isOocTopic && myCharacters.map(char => (<option key={char.id} value={char.id}>{char.character_name}</option>))}
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
              className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white"
              // Use the conditional placeholder text
              placeholder={pageText.titlePlaceholder}
            />
</div>
        <div>
          <label htmlFor="reply-content" className="block text-sm font-medium text-gray-300">Your Post:</label>
          <textarea
                    id="reply-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-32 p-2 bg-gray-900 border border-gray-600 rounded-md text-white"
                    placeholder={pageText.contentPlaceholder} // Using the correct variable
                    disabled={isSubmitting}
                    required
                />
        </div>
             {!isOocTopic && (
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
             )}
            <button type="submit" className="py-2 px-6 border border-transparent rounded-md shadow-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : pageText.submitButton}
            </button>
          {error && <p className="text-red-400 mt-4">{error}</p>}
        </form>
      </div>
    </main>
  );
}