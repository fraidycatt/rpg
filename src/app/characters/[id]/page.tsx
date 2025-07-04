'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// --- Helper functions to translate our integer codes into text ---
const getRpStatusText = (code: number | null) => {
    switch (code) {
        case 1: return 'Open to All';
        case 2: return 'Ask First';
        case 3: return 'Friends Only';
        case 4: return 'Closed';
        default: return 'Not Set';
    }
};

const getGenderText = (code: number | null) => {
    switch (code) {
        case 1: return 'Male';
        case 2: return 'Female';
        case 3: return 'Non-binary';
        default: return 'Not Set';
    }
};

// --- Updated interfaces to include all the new data from our API ---
interface Character {
  id: number;
  user_id: number;
  character_name: string;
  character_class: string;
  level: number;
  hp: number;
  mp: number;
  xp: number;
  rp_status: number;
  gender: number;
  appearance: string;
  personality: string;
  history: string;
}

interface Relationship {
  relationship_id: number;
  status: string;
  character_id: number;
  character_name: string;
}

interface Genre {
    name: string;
    topic_count: string; // The database returns count as a string
}

// --- NEW: Interface for the narrative data we expect ---
interface Narrative {
    id: number;
    title: string;
    summary: string;
    author_username: string;
}

interface Activity {
    id: string;
    attributes: {
        title: string;
    }
}

interface ProfileData {
  character: Character;
  relationships: Relationship[];
  topGenres: Genre[];
  recentActivity: Activity[];
}

export default function CharacterDetailPage(props: { params: { id: string } }) {
  const { id: profileCharacterId } = use(props.params);
  const { user: loggedInUser, token } = useAuth();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [selectedMyCharacter, setSelectedMyCharacter] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [narratives, setNarratives] = useState<Narrative[]>([]);

  // The fetch function now sets all the new data into state
  const fetchPageData = useCallback(async () => {
    if (!profileCharacterId) return;
    setIsLoading(true);
    try {
      const profileRes = await fetch(`http://localhost:3001/api/characters/${profileCharacterId}`);
      if (!profileRes.ok) throw new Error('Could not load character profile.');
      
      const profileJson = await profileRes.json();
      setProfileData(profileJson); 

      if (loggedInUser) {
        const myProfileRes = await fetch(`http://localhost:3001/api/v1/profiles/${loggedInUser.username}`);
        if (myProfileRes.ok) {
          const myProfileJson = await myProfileRes.json();
          setMyCharacters(myProfileJson.characters);
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [profileCharacterId, loggedInUser?.username]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

    // --- NEW: A separate useEffect to fetch the narratives for this character ---
  useEffect(() => {
    // Only run this fetch if we have successfully loaded the main profile data
    if (profileData?.character.id) {
        const fetchNarratives = async () => {
            try {
                // We call the new backend endpoint we just created in characters.js
                const res = await fetch(`http://localhost:3001/api/characters/${profileData.character.id}/narratives`);
                if (res.ok) {
                    const narrativesData = await res.json();
                    setNarratives(narrativesData);
                }
            } catch (err) {
                console.error("Failed to fetch character's narratives", err);
            }
        };
        fetchNarratives();
    }
  }, [profileData]); // This effect runs whenever profileData changes

  const handleSetRelationship = async (e: React.FormEvent) => {
    // This function from your original file is correct and remains unchanged.
    e.preventDefault();
    if (!selectedStatus || !selectedMyCharacter || !profileData) return;
    try {
      await fetch(`http://localhost:3001/api/v1/relationships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({
          characterOneId: parseInt(selectedMyCharacter, 10),
          characterTwoId: profileData.character.id,
          status: selectedStatus
        })
      });
      alert('Relationship status updated!');
      fetchPageData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) return <p className="p-24 text-white">Loading Character...</p>;
  if (error) return <p className="p-24 text-red-500">Error: {error}</p>;
  if (!profileData) return <p className="p-24 text-white">Character not found.</p>;

  const { character, relationships, topGenres, recentActivity } = profileData;
  const isOwner = loggedInUser?.userId === character.user_id;

  return (
    <main className="flex justify-center p-8 sm:p-12 bg-gray-900 text-white min-h-screen">
      <div className="w-full max-w-5xl space-y-12">
        
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-5xl font-bold text-white tracking-tight">{character.character_name}</h1>
                <p className="text-2xl text-purple-400 mt-2">Level {character.level} {character.character_class}</p>
            </div>
            {isOwner && (
                <Link href={`/account/characters/edit/${character.id}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Edit Character
                </Link>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-400 text-sm mb-2 uppercase tracking-wider">Details</h3>
                    <div className="space-y-1">
                        <p><strong>Gender:</strong> {getGenderText(character.gender)}</p>
                        <p><strong>Status:</strong> {getRpStatusText(character.rp_status)}</p>
                    </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-400 text-sm mb-2 uppercase tracking-wider">Stats</h3>
                    <div className="space-y-1">
                        <p><strong>HP:</strong> {character.hp}</p>
                        <p><strong>MP:</strong> {character.mp}</p>
                        <p><strong>XP:</strong> {character.xp}</p>
                    </div>
                </div>
                {/* --- NEW: Top Genres Card --- */}
                <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-400 text-sm mb-2 uppercase tracking-wider">Top Genres</h3>
                    {topGenres.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {topGenres.map(genre => (
                                <span key={genre.name} className="bg-purple-500/20 text-purple-200 text-xs font-semibold px-2.5 py-0.5 rounded">
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                    ) : <p className="text-sm text-gray-500">No genres yet.</p>}
                </div>
            </div>

            <div className="md:col-span-2 space-y-6 prose prose-invert max-w-none">
                {character.appearance && (
                    <div>
                        <h3 className="text-xl font-semibold border-b border-gray-700 pb-2">Appearance</h3>
                        <p className="mt-2 text-gray-300">{character.appearance}</p>
                    </div>
                )}
                {character.personality && (
                    <div>
                        <h3 className="text-xl font-semibold border-b border-gray-700 pb-2">Personality</h3>
                        <p className="mt-2 text-gray-300">{character.personality}</p>
                    </div>
                )}
                 {character.history && (
                    <div>
                        <h3 className="text-xl font-semibold border-b border-gray-700 pb-2">History</h3>
                        <p className="mt-2 text-gray-300">{character.history}</p>
                    </div>
                )}
            </div>
        </div>

        {/* --- NEW: Narratives and Recent Activity Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
  <h2 className="text-2xl font-semibold mb-4">Narratives ({narratives.length})</h2>
  
  {/* We check for narratives before rendering the scrollable container */}
  {narratives.length > 0 ? (
    // This new div is our scrollable container
    <div className="max-h-[340px] overflow-y-auto pr-2 space-y-2">
      {narratives.map((narrative) => (
        <Link 
          key={narrative.id} 
          href={`/narratives/${narrative.id}`} 
          className="block bg-gray-800/50 p-4 rounded-lg hover:bg-gray-700/80 transition-colors"
        >
          <p className="font-semibold text-white truncate">{narrative.title}</p>
          <p className="text-xs text-gray-400 mt-1">
            By {narrative.author_username}
          </p>
        </Link>
      ))}
    </div>
  ) : (
    <p className="text-gray-400">{character.character_name} has not participated in any narratives yet.</p>
  )}
</div>
            <div>
  <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
  {recentActivity.length > 0 ? (
    // We use a div with grid for a clean, single-column layout
    <div className="grid grid-cols-1 gap-3">
      {/* This is the key fix: .slice(0, 5) creates a new array 
        with only the first 5 items from recentActivity.
      */}
      {recentActivity.slice(0, 5).map(topic => (
        <Link 
          key={topic.id} 
          href={`/story/topics/${topic.id}`} 
          className="block bg-gray-800/50 p-3 rounded-md hover:bg-gray-700/80 transition-colors"
        >
          <p className="text-white truncate">{topic.attributes.title}</p>
        </Link>
      ))}
    </div>
  ) : (
    <p className="text-gray-500">This character has not been active recently.</p>
  )}
</div>
        </div>

        {/* Relationships Section */}
        <div>
          <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-4">
            Relationships Declared by {character.character_name} ({relationships.length})
          </h2>
          {relationships.length > 0 ? (
            <ul className="space-y-3">
              {relationships.map((rel) => (
                <li key={rel.relationship_id} className="bg-gray-800/50 p-4 rounded-lg flex justify-between items-center">
                  <p className="text-white">
                    Views <Link href={`/characters/${rel.character_id}`} className="font-bold text-purple-400 hover:underline">{rel.character_name}</Link> as a...
                  </p>
                  <span className="font-bold text-lg">{rel.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">{character.character_name} has not declared any relationships yet.</p>
          )}
        </div>
{/* Interactive "Declare Relationship" Form */}
        {(loggedInUser && loggedInUser.userId !== character.user_id) && (
          <div className="bg-gray-800/50 p-6 rounded-lg mt-8 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Declare Your Relationship</h3>
            <form onSubmit={handleSetRelationship} className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-grow w-full">
                <label htmlFor="my-character-select" className="block text-sm mb-1">As Character:</label>
                <select
                  id="my-character-select"
                  value={selectedMyCharacter}
                  onChange={(e) => setSelectedMyCharacter(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2"
                  required
                >
                  <option value="" disabled>-- Select Your Character --</option>
                  {myCharacters.map(char => (
                    <option key={char.id} value={char.id}>{char.character_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-grow w-full">
                <label htmlFor="status-select" className="block text-sm mb-1">My relationship to {character.character_name} is...</label>
                <select
                  id="status-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2"
                  required
                >
                  <option value="" disabled>-- Select a Status --</option>
                <option value="Nemesis">Nemesis</option>
                <option value="Rival">Rival</option>
                <option value="Neutral">Neutral</option>
                <option value="Ally">Ally</option>
                <option value="Good Friend">Good Friend</option>
                <option value="Best Friend">Best Friend</option>
                <option value="Crush">Crush</option>
                <option value="Lover">Lover</option>
                <option value="Ex-lover">Ex-lover</option>
                <option value="Married">Married</option>
                <option value="Family">Family</option>
              </select>
              </div>

              <button type="submit" className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-md font-medium w-full sm:w-auto">
                Update Status
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}