'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

// Define the shape of the props our component will receive
interface EditPostFormProps {
  postId: string;
  initialContent: string;
  onSave: () => void;   // A function to call when saving is successful (to refresh the page)
  onCancel: () => void; // A function to call when the user clicks "Cancel"
}

export default function EditPostForm({ postId, initialContent, onSave, onCancel }: EditPostFormProps) {
  const { token } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // We call the new backend endpoint we created
      const res = await fetch(`http://localhost:3001/api/v1/story/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update post.');
      }

      // If successful, call the onSave function passed in via props
      onSave();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-40 p-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:ring-purple-500 focus:border-purple-500"
        required
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="py-2 px-6 border border-transparent rounded-md shadow-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 text-sm text-gray-300 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}