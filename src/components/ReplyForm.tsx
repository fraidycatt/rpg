'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

// Define the shape of a character object for our props
interface Character {
  id: number;
  character_name: string;
}

// The component now needs to know the topicId AND the user's list of characters
interface ReplyFormProps {
  topicId: string;
  myCharacters: Character[];
  onReply: () => void; 
}

export default function ReplyForm({ topicId, myCharacters }: ReplyFormProps) {
  const { token } = useAuth();
  
  // New state to keep track of which character is selected
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!content.trim() || !selectedCharacterId) {
      setError('You must select a character and write a reply.');
      return;
    }
    setIsSubmitting(true);

    try {
      // We now send the selected characterId in the request body
      const res = await fetch('http://localhost:3001/api/v1/story/posts/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          content, 
          topicId, 
          characterId: parseInt(selectedCharacterId, 10) 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to post reply.');
      }

      setContent('');
      setSelectedCharacterId('');
      alert('Reply posted successfully! The page will now refresh.');
      window.location.reload();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg mt-8 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Post a Reply</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
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