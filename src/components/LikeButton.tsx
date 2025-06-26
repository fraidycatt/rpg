'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface LikeButtonProps {
  initialLikeCount: number;
  narrativeId: number;
}

export default function LikeButton({ initialLikeCount, narrativeId }: LikeButtonProps) {
  const { token } = useAuth();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(false); // We can improve this later by checking if the user has already liked it
  const [error, setError] = useState('');

  // In src/components/LikeButton.tsx

const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // --- THIS IS THE FIX ---
    // These two lines stop the click from affecting the parent Link component.
    e.stopPropagation();
    e.preventDefault();

    // The rest of your existing logic stays exactly the same...
    if (!token) {
        alert('Please log in to like a story.');
        return;
    }

    setLikeCount(likeCount + 1);
    setIsLiked(true);
    setError('');

    try {
        const res = await fetch(`http://localhost:3001/api/v1/narratives/${narrativeId}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            setLikeCount(likeCount); 
            setIsLiked(false);
            const data = await res.json();
            setError(data.message || 'An error occurred.');
        }
    } catch (err) {
        setLikeCount(likeCount);
        setIsLiked(false);
        setError('An error occurred.');
    }
};

  return (
    <div>
      <button
        onClick={handleLike}
        disabled={isLiked}
        className="flex items-center gap-2 text-sm font-mono text-gray-400 disabled:text-pink-400"
      >
        {/* The heart icon changes based on the 'isLiked' state */}
        <svg className={`w-4 h-4 ${isLiked ? 'text-pink-500' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
        {likeCount} Likes
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}