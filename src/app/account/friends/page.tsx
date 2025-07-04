'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Define the shape of our data for TypeScript
interface Friend {
  user_id: number;
  username: string;
  friendship_id: number; // The ID of the relationship itself
}

interface FriendRequest {
  friendship_id: number;
  user_id: number;
  username: string;
}

export default function FriendsPage() {
  const { token, user } = useAuth(); // Get the auth token and current user

  // State for our lists, loading status, and errors
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addFriendUsername, setAddFriendUsername] = useState('');

  // This function will fetch all our data from the backend
  const fetchData = async () => {
    if (!token) return; // Don't fetch if not logged in

    try {
      // We use Promise.all to run both API calls at the same time for speed
      const [friendsRes, requestsRes] = await Promise.all([
        fetch('http://localhost:3001/api/v1/friends', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/v1/friends/requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!friendsRes.ok || !requestsRes.ok) {
        throw new Error('Failed to fetch social data.');
      }

      const friendsData = await friendsRes.json();
      const requestsData = await requestsRes.json();

      setFriends(friendsData);
      setRequests(requestsData);

    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Run the data fetching function once when the component loads
  useEffect(() => {
    fetchData();
  }, [token]);

  const handleAccept = async (friendshipId: number) => {
    await fetch(`http://localhost:3001/api/v1/friends/accept/${friendshipId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData(); // After accepting, re-fetch the data to update the lists
  };

  // Add this new function inside your FriendsPage component
const handleAddFriend = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  if (!addFriendUsername.trim()) return;

  try {
    const res = await fetch(`http://localhost:3001/api/v1/friends/request`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      // We now send the username instead of the ID
      body: JSON.stringify({ recipientUsername: addFriendUsername }) 
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to send request.');
    }
    alert('Friend request sent!');
    setAddFriendUsername('');
  } catch (err: any) {
    setError(err.message);
  }
};

  const handleDeclineOrRemove = async (friendshipId: number) => {
    await fetch(`http://localhost:3001/api/v1/friends/${friendshipId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData(); // After declining/removing, re-fetch the data
  };

  if (!user) return (
    <main className="flex justify-center items-center min-h-screen">
      <p className="text-white"><Link href="/login" className="text-purple-400 hover:underline">Log in</Link> to view your friends.</p>
    </main>
  );

  if (isLoading) return <p className="p-24 text-white">Loading Friends List...</p>;
  if (error) return <p className="p-24 text-red-500">Error: {error}</p>;

  return (
    <main className="flex justify-center p-8 sm:p-12 bg-gray-900 text-white min-h-screen">
      <div className="w-full max-w-4xl space-y-12">
        <div>
          <h1 className="text-4xl font-bold text-purple-400 mb-4">Social Hub</h1>
          {/* This goes under your "Social Hub" h1 tag */}
<form onSubmit={handleAddFriend} className="flex items-center gap-2 mb-8">
  <input
    type="text"
    value={addFriendUsername} // <-- Use new state variable
    onChange={(e) => setAddFriendUsername(e.target.value)} // <-- Use new state setter
    placeholder="Enter a username to add friend..." 
    className="flex-grow px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
  />
  <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none">
    Send Request
  </button>
</form>
{error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        </div>

        {/* Section for Pending Requests */}
        <div>
          <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-4">Pending Friend Requests ({requests.length})</h2>
          {requests.length > 0 ? (
            <ul className="space-y-3">
              {requests.map(req => (
                <li key={req.friendship_id} className="bg-gray-800/50 p-4 rounded-lg flex justify-between items-center">
                  <p className="text-white">{req.username} wants to be your friend.</p>
                  <div className="space-x-2">
                    <button onClick={() => handleAccept(req.friendship_id)} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded">Accept</button>
                    <button onClick={() => handleDeclineOrRemove(req.friendship_id)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded">Decline</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No pending friend requests.</p>
          )}
        </div>

        {/* Section for Current Friends */}
        <div>
          <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-4">Friends ({friends.length})</h2>
          {friends.length > 0 ? (
            <ul className="space-y-3">
              {friends.map(friend => (
                <li key={friend.friendship_id} className="bg-gray-800/50 p-4 rounded-lg flex justify-between items-center">
                  <Link href={`/users/${friend.username}`} className="text-white font-semibold hover:text-purple-400">
  {friend.username}
</Link>
                  <button onClick={() => handleDeclineOrRemove(friend.friendship_id)} className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold py-1 px-3 rounded">Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">You haven't added any friends yet.</p>
          )}
        </div>

      </div>
    </main>
  );
}