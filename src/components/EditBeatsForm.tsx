'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

// Define the shape of our data objects
interface StoryBeat {
  id: string;
  name: string;
}

interface EditBeatsFormProps {
  discussionId: string;
  onSave: () => void;
  onCancel: () => void;
}

export default function EditBeatsForm({ discussionId, onSave, onCancel }: EditBeatsFormProps) {
  const { token } = useAuth();
  const [allBeats, setAllBeats] = useState<StoryBeat[]>([]);
  const [selectedBeatIds, setSelectedBeatIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This useEffect fetches both the list of ALL possible beats
  // AND the list of beats currently applied to THIS discussion.
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch all available story beats
        const allBeatsRes = await fetch('http://localhost:3001/api/v1/discovery/beats');
        if (!allBeatsRes.ok) throw new Error('Could not fetch story beats.');
        const allBeatsData = await allBeatsRes.json();
        setAllBeats(allBeatsData);

        // Fetch the beats already selected for this specific discussion
        const selectedBeatsRes = await fetch(`http://localhost:3001/api/v1/discovery/topics/${discussionId}/beats`);
        if (!selectedBeatsRes.ok) throw new Error('Could not fetch current tags for this topic.');
        const selectedBeatsData = await selectedBeatsRes.json();
        
        // Pre-populate the checkboxes with the currently selected beats
        setSelectedBeatIds(new Set(selectedBeatsData.map((beat: StoryBeat) => beat.id)));

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [discussionId]);

  const handleBeatChange = (beatId: string) => {
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
    try {
        // We use the existing tag-topic endpoint. It's built to handle updates perfectly.
        await fetch('http://localhost:3001/api/v1/discovery/tag-topic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ discussionId: discussionId, beatIds: Array.from(selectedBeatIds) }),
        });
        onSave(); // Call the onSave function to close the modal and refresh
    } catch (err: any) {
        setError(err.message);
    }
  };

  if (isLoading) return <p className="p-4 text-center">Loading beats...</p>;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-gray-600">
        <h3 className="text-xl font-bold mb-4">Edit Story Beats</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 border border-gray-600 rounded-md grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
            {allBeats.map((beat) => (
              <div key={beat.id} className="flex items-center">
                <input
                  id={`beat-edit-${beat.id}`}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-500 text-purple-600 focus:ring-purple-500"
                  onChange={() => handleBeatChange(beat.id)}
                  checked={selectedBeatIds.has(beat.id)}
                />
                <label htmlFor={`beat-edit-${beat.id}`} className="ml-3 text-sm text-gray-200">{beat.name}</label>
              </div>
            ))}
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onCancel} className="py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-md">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-md">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}