'use client';

import { useState, useEffect } from 'react'; // <-- Add useEffect
import { useAuth } from '@/context/AuthContext';

interface Character { id: number; character_name: string; }

interface ReplyFormProps {
  topicId: string;
  myCharacters: Character[];
  onReply: () => void;
  isOoc: boolean; 
}

export default function ReplyForm({ topicId, myCharacters, onReply, isOoc }: ReplyFormProps) {
  const { user, token } = useAuth();
  
  // The selectedAuthor can be a character ID or the string 'user' for OOC posts
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NEW: useEffect to set the default author ---
  useEffect(() => {
    if (isOoc) {
      setSelectedAuthor('user');
    } else if (myCharacters && myCharacters.length > 0) {
      // Default to the first character for IC posts
      setSelectedAuthor(myCharacters[0].id.toString());
    }
  }, [isOoc, myCharacters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!content.trim() || !selectedAuthor) {
      setError('You must select an author and write a reply.');
      return;
    }
    setIsSubmitting(true);

    try {
      // This logic correctly determines if a characterId should be sent
      const characterId = !isOoc && selectedAuthor !== 'user' ? parseInt(selectedAuthor, 10) : null;

      await fetch('http://localhost:3001/api/v1/story/posts/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content, topicId, characterId }),
      });
      
      // Reset form and refresh the topic page
      setContent('');
      onReply();

    } catch (err: any) {
      const data = await err.response?.json();
      setError(data?.message || 'Failed to post reply.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg mt-8 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Post a Reply</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="author-select" className="block text-sm font-medium text-gray-300">Post as:</label>
          {/* Conditionally render the author selection */}
          {isOoc ? (
            <p className="text-white font-semibold mt-1 py-2">{user?.username} (You)</p>
          ) : (
            <select id="author-select" value={selectedAuthor} onChange={(e) => setSelectedAuthor(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2" required>
              <option value="" disabled>-- Select Your Character --</option>
              {myCharacters.map(char => (
                <option key={char.id} value={char.id}>{char.character_name}</option>
              ))}
            </select>
          )}
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
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="py-2 px-6 border border-transparent rounded-md shadow-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Submit Reply'}
        </button>
      </form>
    </div>
  );
}