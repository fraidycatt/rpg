'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Define the shape of our data for clarity
interface Character {
  id: number;
  user_id: number;
  character_name: string;
  character_class: string;
  level: number;
  hp: number;
  mp: number;
  xp: number;
}

interface Relationship {
  relationship_id: number;
  status: string;
  character_id: number;
  character_name: string;
}

interface ProfileData { // Let's define the shape of our full payload
  character: Character;
  relationships: Relationship[];
}

export default function CharacterDetailPage(props: { params: { id: string } }) {
  const { id: profileCharacterId } = use(props.params);
  const { user: loggedInUser, token } = useAuth();

  // We only need ONE state variable for all the profile data
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);

  // State for the form
  const [selectedMyCharacter, setSelectedMyCharacter] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This function is now much cleaner
  const fetchPageData = useCallback(async () => {
    if (!profileCharacterId) return;
    // We set loading to true at the beginning of a fetch
    setIsLoading(true);
    try {
      const profileRes = await fetch(`http://localhost:3001/api/v1/profiles/id/${profileCharacterId}`);
      if (!profileRes.ok) throw new Error('Could not load character profile.');
      const profileJson = await profileRes.json();
      setProfileData(profileJson); // This is the only state we need to set for the profile

      // The logic for fetching the logged-in user's characters is still needed for the form
      if (loggedInUser) {
        const myProfileRes = await fetch(`http://localhost:3001/api/v1/profiles/${loggedInUser.username}`);
        if (!myProfileRes.ok) throw new Error('Could not load your character list.');
        const myProfileJson = await myProfileRes.json();
        setMyCharacters(myProfileJson.characters);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [profileCharacterId, loggedInUser, token]);

  // This one useEffect is all we need
  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  // The handleSetRelationship function is perfect, but we need to update one line
  const handleSetRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus || !selectedMyCharacter || !profileData) return; // check for profileData here
    try {
      await fetch(`http://localhost:3001/api/v1/relationships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({
          characterOneId: parseInt(selectedMyCharacter, 10),
          characterTwoId: profileData.character.id, // Read from profileData
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
  // We now check for profileData instead of character
  if (!profileData) return <p className="p-24 text-white">Character not found.</p>;

  // Now we destructure the data right before we use it in the return
  const { character, relationships } = profileData;

  return (
    <main className="flex justify-center p-8 sm:p-12 bg-gray-900 text-white min-h-screen">
      <div className="w-full max-w-4xl space-y-12">
        
        {/* Character Info Card */}
        <div className="w-full mx-auto bg-gray-800/50 rounded-2xl p-8 shadow-2xl border border-gray-700">
          <h1 className="text-5xl font-bold text-white tracking-tight">{character.character_name}</h1>
          <p className="text-2xl text-purple-400 mt-2">Level {character.level} {character.character_class}</p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-green-500/10 p-4 rounded-lg"><p className="text-sm tracking-widest uppercase text-green-400">HP</p><p className="text-3xl font-bold">{character.hp}</p></div>
            <div className="bg-blue-500/10 p-4 rounded-lg"><p className="text-sm tracking-widest uppercase text-blue-400">MP</p><p className="text-3xl font-bold">{character.mp}</p></div>
            <div className="bg-yellow-500/10 p-4 rounded-lg"><p className="text-sm tracking-widest uppercase text-yellow-400">XP</p><p className="text-2xl font-bold">{character.xp}</p></div>
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


