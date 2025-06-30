// src/components/ReplyForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // <-- THIS IS THE FIX. I have added the missing import.

// Define the shape of the props this component expects
interface ReplyFormProps {
  topicId: string;
  myCharacters: any[];
  onReply: () => void;
  isOoc: boolean;
}

export default function ReplyForm({ topicId, myCharacters, onReply, isOoc }: ReplyFormProps) {
  const { user, token } = useAuth(); // This line will now work correctly.
  
  const initialAuthor = isOoc ? 'user' : (myCharacters[0]?.id.toString() || '');
  const [selectedAuthor, setSelectedAuthor] = useState(initialAuthor);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const placeholderText = isOoc ? "Write your OOC reply..." : "Write your story...";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!content.trim() || !selectedAuthor) {
      setError('You must select an author and write a reply.');
      return;
    }
    setIsSubmitting(true);

    try {
      const characterId = !isOoc && selectedAuthor !== 'user' ? parseInt(selectedAuthor, 10) : null;
      const res = await fetch('http://localhost:3001/api/v1/story/posts/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content, topicId, characterId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to post reply.');
      }
      
      setContent('');
      if (!isOoc && myCharacters[0]) {
        setSelectedAuthor(myCharacters[0].id.toString());
      }
      onReply(); 

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
          <label htmlFor="author-select" className="block text-sm font-medium text-gray-300">Post as:</label>
          
          {isOoc ? (
            <p className="text-white font-semibold mt-1 py-2">{user?.username} (You)</p>
          ) : (
            <select id="author-select" value={selectedAuthor} onChange={(e) => setSelectedAuthor(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2" required>
              <option value="" disabled>-- Select Your Character --</option>
              {myCharacters.map((char: any) => (
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
            placeholder={placeholderText}
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