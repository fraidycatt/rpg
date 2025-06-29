// src/components/OocReplyForm.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function OocReplyForm({ topicId }: { topicId: string }) {
    const { token } = useAuth();
    const [content, setContent] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!content.trim()) {
            setError('You cannot post an empty reply.');
            return;
        }
        setIsSubmitting(true);

        try {
            // This endpoint is designed to handle replies without a characterId
            const res = await fetch(`http://localhost:3001/api/v1/story/posts/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content, topicId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to post reply.');
            }

            // Reset form and refresh the page to show the new post
            setContent('');
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
                    <label htmlFor="reply-content" className="block text-sm font-medium text-gray-300">Your Post:</label>
                    <textarea
                        id="reply-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-32 p-2 bg-gray-900 border border-gray-600 rounded-md text-white"
                        placeholder="Write your reply..."
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