'use client'; // This component now has a button, so it should be a Client Component

import Link from 'next/link';
import LikeButton from './LikeButton'; // Assuming LikeButton is in the same folder

export default function NarrativeCard({ narrative }: { narrative: any }) {
  return (
    // The main container is no longer a link itself.
    <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 flex flex-col h-full">
      
      {/* The top part IS a link. It contains the clickable title and summary. */}
      <Link 
        href={`/story/narratives/${narrative.id}`} 
        className="block p-6 hover:bg-purple-500/10 flex-grow"
      >
        <h3 className="text-xl font-bold text-white truncate">{narrative.title}</h3>
        <p className="text-sm text-gray-400 mt-1">by {narrative.author_username}</p>
        <p className="text-sm text-gray-300 mt-4 h-20 overflow-hidden text-ellipsis">
          {narrative.summary}
        </p>
      </Link>

      {/* The bottom part IS NOT a link. It contains the stats and the button. */}
      <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center px-6 pb-4">
        <LikeButton initialLikeCount={narrative.like_count} narrativeId={narrative.id} />
        <span className="text-xs font-mono text-gray-400">
          🗓️ {new Date(narrative.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}