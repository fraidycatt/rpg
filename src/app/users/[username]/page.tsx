'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Define the shape of our expected data
interface ProfileData {
  user: { id: number; username: string; };
  characters: any[];
  friendship: { status: string; id: number | null; };
}

export default function UserProfilePage(props: { params: { username: string } }) {
  const { username } = use(props.params);
  const { token, user: loggedInUser } = useAuth();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- HANDLER FUNCTIONS ARE NOW HERE, IN THE MAIN COMPONENT SCOPE ---
  const handleAddFriend = async () => {
  // The username is the one from the page's params!
  const recipientUsername = username; 

  try {
    await fetch(`http://localhost:3001/api/v1/friends/request`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientUsername }) // Send the username
    });
    alert('Friend request sent!');
    // Re-fetch the profile data to update the button's state to "Pending"
    fetchProfileData(); 
  } catch (err: any) {
    setError(err.message);
  }
};

  const handleRemoveFriend = async () => {
    if (!profileData?.friendship.id || !token) return;
    try {
      await fetch(`http://localhost:3001/api/v1/friends/${profileData.friendship.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Friend removed.');
      fetchProfileData();
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  // The data fetching logic now lives in its own function
  const fetchProfileData = async () => {
    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`http://localhost:3001/api/v1/profiles/${username}`, { headers });
      if (!res.ok) throw new Error('Profile not found or failed to load.');
      const data = await res.json();
      setProfileData(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // The useEffect hook now ONLY handles fetching data when the component loads
  useEffect(() => {
    // We moved the handler functions out of here!
    fetchProfileData();
  }, [username, token]);

  if (isLoading) return <p className="p-24 text-white">Loading Profile...</p>;
  if (error) return <p className="p-24 text-red-500">Error: {error}</p>;
  if (!profileData) return <p className="p-24 text-white">Profile not found.</p>;

  // Your JSX can now see handleAddFriend and handleRemoveFriend
  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-12 bg-gray-900 text-white">
      <div className="w-full max-w-4xl space-y-8">
        <div className="bg-gray-800/50 p-6 rounded-lg flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-purple-400">{profileData.user.username}'s Profile</h1>
          </div>
          <div>
            {/* --- THE SMART BUTTON LOGIC --- */}
            {loggedInUser?.userId === profileData.user.id ? (
              <span className="text-sm text-gray-500">This is you!</span>
            ) : profileData.friendship.status === 'accepted' ? (
              <button onClick={handleRemoveFriend} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Remove Friend</button>
            ) : profileData.friendship.status === 'pending' ? (
              <button disabled className="bg-gray-600 text-white font-bold py-2 px-4 rounded cursor-not-allowed">Request Pending</button>
            ) : (
              <button onClick={handleAddFriend} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Add Friend</button>
            )}
          </div>
        </div>
         {/* Character List Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
  <h2 className="text-2xl font-semibold">Characters</h2>
  {/* Only show this button if you are viewing your own profile */}
  {profileData.friendship.status === 'self' && (
    <Link href="/account/characters/new" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm">
      + Create New
    </Link>
  )}
</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profileData.characters.length > 0 ? (
              profileData.characters.map(character => (
                <Link href={`/characters/${character.id}`} key={character.id} className="block p-4 bg-gray-700/50 rounded-md hover:bg-gray-700">
                  <p className="font-bold text-lg">{character.character_name}</p>
                  <p className="text-sm text-gray-400">Level {character.level} {character.character_class}</p>
                </Link>
              ))
            ) : (
              <p className="text-gray-400 col-span-full">This user has not created any characters yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}