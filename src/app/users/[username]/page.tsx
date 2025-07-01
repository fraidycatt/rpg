'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Helper function to map the availability code to a user-friendly string
const getAvailabilityText = (code: number | null) => {
    switch (code) {
        case 1: return 'Daily';
        case 2: return 'A Few Times a Week';
        case 3: return 'Weekly';
        case 4: return 'Sporadic';
        default: return 'Not specified';
    }
};

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const { username } = use(params);
  const { user: loggedInUser, token } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This function is for fetching ALL profile data
  const fetchProfile = async () => {
    try {
        const res = await fetch(`http://localhost:3001/api/v1/profiles/${username}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error('User not found');
        const data = await res.json();
        setProfileData(data);
    } catch (err) {
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username, token]);

  // These handlers are for the friend buttons
  const handleAddFriend = async () => {
    // ... (Your existing, correct handleAddFriend logic)
  };

  const handleRemoveFriend = async () => {
    // ... (Your existing, correct handleRemoveFriend logic)
  };

  if (isLoading) return <p className="p-24 text-white animate-pulse">Loading Profile...</p>;
  if (!profileData) return <p className="p-24 text-red-400">User not found.</p>;

  return (
    <main className="flex justify-center p-8 sm:p-12 bg-gray-900 text-white min-h-screen">
      <div className="w-full max-w-4xl">

        {/* --- TOP PROFILE SECTION --- */}
        <div className="flex items-start space-x-8 p-8 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="w-24 h-24 bg-purple-900/50 rounded-full flex-shrink-0">
            {/* Placeholder for an avatar */}
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold">{profileData.user.username}</h1>
              {/* --- FRIEND BUTTONS (FIXED) --- */}
              <div className="friend-actions">
                {loggedInUser && (
                  <>
                    {loggedInUser?.userId === profileData.user.id ? (
                      <Link href="/account/settings" className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Edit Your Profile</Link>
                    ) : profileData.friendship?.status === 'accepted' ? (
                      <button onClick={handleRemoveFriend} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Remove Friend</button>
                    ) : profileData.friendship?.status === 'pending' ? (
                      <button disabled className="bg-gray-600 text-white font-bold py-2 px-4 rounded cursor-not-allowed">Request Pending</button>
                    ) : (
                      <button onClick={handleAddFriend} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add Friend</button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* --- NEW PROFILE DETAILS SECTION --- */}
            <div className="mt-4 border-t border-gray-600 pt-4 text-sm text-gray-300 space-y-2">
                {profileData.user.pronouns && <p><strong>Pronouns:</strong> {profileData.user.pronouns}</p>}
                {profileData.user.timezone && <p><strong>Timezone:</strong> {profileData.user.timezone}</p>}
                {profileData.user.availability && <p><strong>Availability:</strong> {getAvailabilityText(profileData.user.availability)}</p>}
            </div>
            
            {profileData.user.bio && (
                <div className="mt-4 prose prose-invert max-w-none">
                    <p>{profileData.user.bio}</p>
                </div>
            )}
          </div>
        </div>

        {/* --- CHARACTERS SECTION (FIXED) --- */}
        <div className="mt-8 border-t border-gray-700 pt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Characters</h2>
            {/* We now check directly if the logged-in user is the same as the profile owner */}
            {loggedInUser?.userId === profileData.user.id && (
              <Link href="/account/characters/new" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm">
                + Create New
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profileData.characters.map((char: any) => (
              <Link key={char.id} href={`/characters/${char.id}`} className="bg-gray-800 hover:bg-gray-700/50 p-4 rounded-lg transition-colors">
                <h3 className="font-bold text-lg text-purple-400">{char.character_name}</h3>
                <p className="text-sm text-gray-400">{char.character_class}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}