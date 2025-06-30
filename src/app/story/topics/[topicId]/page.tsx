// src/app/topics/[topicId]/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ReplyForm from '@/components/ReplyForm';

export default function TopicPage({ params }: { params: { topicId: string } }) {
    console.log("--- TopicPage Rerendered ---"); 
    const { topicId } = props.params;
    const { user: loggedInUser, token } = useAuth();

    const [posts, setPosts] = useState<any[]>([]);
    const [isOocThread, setIsOocThread] = useState(false);
    const [authorMap, setAuthorMap] = useState<any>({});
    const [myCharacters, setMyCharacters] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- NEW STRUCTURE ---
    // Effect for fetching CORE page data. This runs when the topic changes.
    useEffect(() => {
        const fetchTopicData = async () => {
            if (!topicId) return;
            setIsLoading(true);
            setError(null);
            try {
                const topicRes = await fetch(`http://localhost:3001/api/v1/story/topic-page-data/${topicId}`);
                if (!topicRes.ok) throw new Error('Failed to fetch topic data.');
                const topicData = await topicRes.json();
                
                setPosts(topicData.posts || []);
                setAuthorMap(topicData.authorMap || {});
                setIsOocThread(topicData.isOocThread);
            } catch (e: any) {
                setError(e.message);
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTopicData();
    }, [topicId]);

    // Effect for fetching USER-SPECIFIC data. This runs only when the user logs in/out.
    useEffect(() => {
        const fetchMyCharacters = async () => {
            if (loggedInUser?.username && token) {
                try {
                    const myProfileRes = await fetch(`http://localhost:3001/api/v1/profiles/${loggedInUser.username}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (myProfileRes.ok) {
                        const myProfileData = await myProfileRes.json();
                        setMyCharacters(myProfileData.characters);
                    }
                } catch (e) {
                    console.error("Failed to fetch user's characters", e);
                }
            } else {
                // If user logs out, clear their character list
                setMyCharacters([]);
            }
        };
        fetchMyCharacters();
    }, [loggedInUser?.username, token]);

    // Memoized refresh handler for the reply form.
    const handleReply = useCallback(async () => {
        try {
            const topicRes = await fetch(`http://localhost:3001/api/v1/story/topic-page-data/${topicId}`);
            if (!topicRes.ok) throw new Error('Failed to re-fetch topic data.');
            const topicData = await topicRes.json();
            setPosts(topicData.posts || []);
            setAuthorMap(topicData.authorMap || {});
        } catch (e: any) {
            console.error("Failed to refresh posts after reply", e);
            setError("Could not load new reply. Please refresh the page.");
        }
    }, [topicId]);

    if (isLoading) return <p className="p-24 text-white">Loading Topic...</p>;
    if (error) return <p className="p-24 text-red-400">Error: {error}</p>;

    return (
        // The JSX for this component remains exactly the same.
        // ... (paste the entire main/return block from your previous version here) ...
        <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
            <div className="w-full max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-purple-400">Viewing Topic</h1>
                <div className="space-y-6">
                    {posts.length > 0 ? posts.map((post) => {
                        const author = authorMap[post.id];
                        return (
                            <div key={post.id} className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
                                <p className="font-bold text-white mb-4">
                                    {author ? (
                                        <Link 
                                            href={author.type === 'character' ? `/characters/${author.id}` : `/users/${author.name}`}
                                            className="hover:text-purple-400"
                                        >
                                            {author.name}
                                        </Link>
                                    ) : (
                                        'System'
                                    )}
                                </p>
                                <div
                                    className="prose prose-invert lg:prose-xl"
                                    dangerouslySetInnerHTML={{ __html: post.attributes.contentHtml }}
                                />
                            </div>
                        );
                    }) : (
                        <div className="bg-gray-800/50 p-6 rounded-lg text-center text-gray-400">
                            <h2 className="text-xl font-semibold text-white">This story is just beginning.</h2>
                            <p className="mt-2">There are no posts here yet. Be the first to write!</p>
                        </div>
                    )}
                </div>
                <div className="mt-8">
                    {loggedInUser ? (
                        <ReplyForm 
                            topicId={topicId} 
                            myCharacters={myCharacters}
                            onReply={handleReply}
                            isOoc={isOocThread}
                        />
                    ) : (
                         <p className="text-center text-lg p-8 bg-gray-800/50 rounded-lg">
                            <Link href="/login" className="text-purple-400 font-bold hover:underline">Log in</Link> to post a reply.
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}