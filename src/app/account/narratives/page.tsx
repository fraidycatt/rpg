'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function MyNarrativesPage() {
  const { user, token } = useAuth();

  const [narratives, setNarratives] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNarratives = async () => {
    if (!token) {
        setIsLoading(false);
        return;
    };
    try {
      const res = await fetch('http://localhost:3001/api/v1/narratives/my-narratives', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Could not fetch your narratives.');
      const data = await res.json();
      setNarratives(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // We only fetch when the token is available
    fetchNarratives();
  }, [token]);

  const handleCreateNarrative = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('http://localhost:3001/api/v1/narratives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({ title, summary }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create narrative.');
      }
      setTitle('');
      setSummary('');
      fetchNarratives(); // Re-fetch the list to show the new one
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) return <p className="p-24 text-white">Loading your narratives...</p>;
  if (!user) return <p className="p-24 text-white">Please <Link href="/login" className="text-purple-400 hover:underline">log in</Link> to manage your narratives.</p>;
  
  return (
    <main className="flex justify-center p-8 sm:p-12 bg-gray-900 text-white min-h-screen">
      <div className="w-full max-w-4xl space-y-12">
        <div>
          <h1 className="text-4xl font-bold text-purple-400 mb-4">The Author's Study</h1>
          <form onSubmit={handleCreateNarrative} className="p-6 bg-gray-800/50 rounded-lg space-y-4">
            <h2 className="text-2xl font-semibold">Start a New Narrative</h2>
            <div>
              <label htmlFor="title" className="block text-sm font-medium">Title</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md p-2" />
            </div>
            <div>
              <label htmlFor="summary" className="block text-sm font-medium">Summary</label>
              <textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md p-2 h-24" />
            </div>
            {error && <p className="text-red-400">{error}</p>}
            <button type="submit" className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-md font-medium">Create Narrative</button>
          </form>
        </div>
        <div>
          <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-4">Your Narratives ({narratives.length})</h2>
          <div className="space-y-4">
            {narratives.map(narrative => (
              <div key={narrative.id} className="bg-gray-800/50 p-4 rounded-lg">
                <Link href={`/story/narratives/${narrative.id}`}>
    <h3 className="text-xl font-bold text-white hover:text-purple-400 transition-colors">{narrative.title}</h3>
</Link>
                <p className="text-gray-400 mt-2">{narrative.summary}</p>
                <Link href={`/account/narratives/manage/${narrative.id}`} className="text-sm text-purple-400 hover:underline mt-4 inline-block">
                    Manage Chapters
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}