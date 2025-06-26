'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function MarkMomentForm({ chapter, myCharacters, onSave, onCancel }: any) {
  const { token } = useAuth();
  const [characterOneId, setCharacterOneId] = useState(chapter?.character_one_id || '');
  const [characterTwoId, setCharacterTwoId] = useState(chapter?.character_two_id || '');
  const [newStatus, setNewStatus] = useState(chapter?.new_relationship_status || '');
  const [note, setNote] = useState(chapter.relationship_change_note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter the chapter's cast list to find who is "me" and who is "them"
  const myParticipatingChars = chapter.participants.filter((p: any) => 
    myCharacters.some((myChar: any) => myChar.id === p.id)
  );
  const otherParticipatingChars = chapter.participants.filter((p: any) => 
    !myCharacters.some((myChar: any) => myChar.id === p.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterOneId || !characterTwoId || !newStatus) {
      alert('Please select both participating characters and a new status.');
      return;
    }
    setIsSubmitting(true);
    try {
      // The API call to log the moment is now targeting the correct, more specific endpoint.
      await fetch(`http://localhost:3001/api/v1/narratives/topics/${chapter.join_id}/log-moment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({ characterOneId: parseInt(characterOneId), characterTwoId: parseInt(characterTwoId), newStatus, note })
      });
      onSave();
    } catch (err: any) {
      alert("Failed to save moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-gray-600">
        <h3 className="text-xl font-bold mb-4">Mark a Relationship Moment in: {chapter.title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">My Character (who participated):</label>
            <select value={characterOneId} onChange={(e) => setCharacterOneId(e.target.value)} className="w-full bg-gray-900 border-gray-600 p-2 rounded-md mt-1" required>
              <option value="">-- Select Your Character --</option>
              {myParticipatingChars.map((char: any) => (<option key={char.id} value={char.id}>{char.character_name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Their Character (who participated):</label>
            <select value={characterTwoId} onChange={(e) => setCharacterTwoId(e.target.value)} className="w-full bg-gray-900 border border-gray-600 p-2 rounded-md mt-1" required>
              <option value="">-- Select a Participant --</option>
              {otherParticipatingChars.map((char: any) => (<option key={char.id} value={char.id}>{char.character_name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">New Relationship Status:</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full bg-gray-900 border border-gray-600 p-2 rounded-md mt-1" required>
              <option value="">-- Select Status --</option>
              <option value="Ally">Ally</option>
              <option value="Rival">Rival</option>
              <option value="Nemesis">Nemesis</option>
              <option value="Neutral">Neutral</option>
              <option value="Family">Family</option>
              <option value="Lover">Lover</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Reason / Note (This will be publicly visible):</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full h-24 bg-gray-900 border border-gray-600 p-2 rounded-md mt-1" placeholder="e.g., He betrayed me at the Northern Gate." />
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onCancel} className="py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-md">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-md disabled:bg-gray-500">{isSubmitting ? "Saving..." : "Save Moment"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


// Main Page Component
export default function ManageNarrativePage(props: { params: { narrativeId: string } }) {
  const { narrativeId } = use(props.params);
  const { token, user } = useAuth();
  const [narrative, setNarrative] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [myCharacters, setMyCharacters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingChapter, setEditingChapter] = useState<any | null>(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [availableTopics, setAvailableTopics] = useState<any[]>([]); 

  useEffect(() => {
    const fetchAvailableTopics = async () => {
      if (!token) return;
      try {
        // We call the correct backend endpoint you already built!
        const res = await fetch(`http://localhost:3001/api/v1/story/users/me/unassigned-topics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Could not fetch available topics.');
        const topics = await res.json();
        
        // We need to filter out topics that are already added to THIS narrative
        const currentChapterTopicIds = chapters.map(c => c.flarum_topic_id.toString());
        const unassignedTopics = topics.filter((topic: any) => !currentChapterTopicIds.includes(topic.id));

        setAvailableTopics(unassignedTopics);
      } catch (e) {
        console.error("Failed to fetch available topics:", e);
      }
    };
    
    // We only run this fetch if we have the list of current chapters already
    if (chapters.length > 0 || !isLoading) {
       fetchAvailableTopics();
    }
  }, [token, chapters, isLoading]);

  const fetchPageData = useCallback(async () => {
    if (!token || !narrativeId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/v1/narratives/${narrativeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Could not load narrative data.');
      const data = await res.json();

      setNarrative(data.narrative);
      setChapters(data.chapters);

      // We still need the full list of our own characters for the top-level logic
      if (user) {
        const myProfileRes = await fetch(`http://localhost:3001/api/v1/profiles/${user.username}`);
        if (myProfileRes.ok) {
            const myProfileData = await myProfileRes.json();
            setMyCharacters(myProfileData.characters);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [token, narrativeId, user]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

    const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic) return;
    await fetch(`http://localhost:3001/api/v1/narratives/${narrativeId}/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ flarumTopicId: selectedTopic })
    });
    fetchPageData();
    setSelectedTopic('');
  };

  const handleRemoveChapter = async (joinId: number) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`http://localhost:3001/api/v1/narratives/topics/${joinId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchPageData();
  };
  
  const handleSaveMoment = () => {
    setEditingChapter(null);
    fetchPageData();
  };

  const handleRemoveMoment = async (joinId: number) => {
        if (!confirm('Are you sure you want to remove this logged moment? This cannot be undone.')) return;
        
        try {
            const res = await fetch(`http://localhost:3001/api/v1/narratives/topics/${joinId}/log-moment`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to remove moment.');

            // Refresh the page data to show the change
            fetchPageData();

        } catch (err: any) {
            alert(err.message);
        }
    };

  if (isLoading) return <p className="p-24 text-white">Loading Narrative Editor...</p>;
  if (!narrative) return <p className="p-24 text-white">Narrative not found.</p>;

  return (
    <main className="flex justify-center p-8 sm:p-12 bg-gray-900 text-white min-h-screen">
      <div className="w-full max-w-4xl space-y-8">
        <Link href="/account/narratives" className="text-purple-400 hover:underline">&larr; Back to Your Narratives</Link>
        <div>
          <h1 className="text-4xl font-bold">{narrative?.title}</h1>
          <p className="text-gray-300 italic mt-2">{narrative?.summary}</p>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-lg">
         <h2 className="text-xl font-semibold mb-4">Add a Chapter</h2>
         <form onSubmit={handleAddChapter} className="flex items-end gap-2">
           <div className="flex-grow">
             <label htmlFor="topic-select" className="block text-sm font-medium">Add an Existing Topic:</label>
             <select id="topic-select" value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md p-2" required>
               <option value="" disabled>{availableTopics.length > 0 ? '-- Select a topic --' : 'No available topics to add'}</option>
               {availableTopics.map(topic => (<option key={topic.id} value={topic.id}>{topic.attributes.title}</option>))}
             </select>
           </div>
           <button type="submit" className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-md font-medium">Add Chapter</button>
         </form>
       </div>
        <div>
          <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-4">Current Chapters</h2>
          <ul className="space-y-3">
            {chapters.map((chapter: any) => (
              <li key={chapter.join_id} className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Chapter {chapter.chapter_order}: {chapter.title}</span>
                  <div className="space-x-2">
                    <button onClick={() => setEditingChapter(chapter)} className="text-xs bg-blue-600 hover:bg-blue-700 py-1 px-3 rounded">Mark Moment</button>
                    <button onClick={() => handleRemoveChapter(chapter.join_id)} className="text-xs bg-red-600 hover:bg-red-700 py-1 px-3 rounded">Unlink Chapter</button>
                  </div>
                </div>
                 {chapter.logged_relationship_id && (
                   <div className="text-sm italic text-purple-300 mt-3 pt-3 border-t border-gray-700">
                    <p>
                        <strong>Relationship Moment:</strong> {chapter.character_one_name} sees {chapter.character_two_name} as <strong>{chapter.new_relationship_status}</strong>.
                    </p>
                    {chapter.relationship_change_note && (
                        <p className="mt-1">
                            <strong>Reason:</strong> {chapter.relationship_change_note}
                        </p>
                    )}
                    <div className="flex-shrink-0 ml-4 space-x-2">
                            <button onClick={() => setEditingChapter(chapter)} className="text-xs font-sans not-italic bg-blue-600/50 hover:bg-blue-600 py-1 px-2 rounded">Edit</button>
                            <button onClick={() => handleRemoveMoment(chapter.join_id)} className="text-xs font-sans not-italic bg-red-600/50 hover:bg-red-600 py-1 px-2 rounded">Remove</button>
                        </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        {editingChapter && (
          <MarkMomentForm 
            chapter={editingChapter}
            myCharacters={myCharacters}
            onSave={handleSaveMoment}
            onCancel={() => setEditingChapter(null)}
          />
        )}
      </div>
    </main>
  );
}

