// src/app/story/topics/[topicId]/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ReplyForm from '@/components/ReplyForm';

export default function TopicPage({ params }: { params: { topicId: string } }) {
    const { topicId } = React.use(params);
    const { user: loggedInUser, token } = useAuth();

    const [posts, setPosts] = useState<any[]>([]);
    // --- FIX: Initialize isOocThread as null to represent a "not yet loaded" state ---
    const [isOocThread, setIsOocThread] = useState<boolean | null>(null);
    const [authorMap, setAuthorMap] = useState<any>({});
    const [myCharacters, setMyCharacters] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Using useCallback to create a stable refresh function
    const fetchPageData = useCallback(async () => {
        if (!topicId) return;
        // No setIsLoading here on re-fetch
        setError(null);
        try {
            // Using the more efficient, unified endpoint
            const res = await fetch(`http://localhost:3001/api/v1/story/topic-page-data/${topicId}`);
            if (!res.ok) throw new Error('Failed to fetch topic data.');
            
            const data = await res.json();
            setPosts(data.posts || []);
            setAuthorMap(data.authorMap || {});
            setIsOocThread(data.isOocThread); // This will now be a boolean
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false); // Only set loading false for the initial load
        }
    }, [topicId]);

    // Initial data fetch
    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    // Character fetch
    useEffect(() => {
        if (loggedInUser && token) {
            const fetchMyCharacters = async () => {
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
            };
            fetchMyCharacters();
        }
    }, [loggedInUser, token]);

    if (isLoading) return <p className="p-24 text-white animate-pulse">Loading Topic...</p>;
    if (error) return <p className="p-24 text-red-400">Error: {error}</p>;

    return (
        <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
            <div className="w-full max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-purple-400">Viewing Topic</h1>
                <div className="space-y-6">
                    {/* The post rendering JSX remains the same */}
                    {posts.length > 0 ? posts.map((post) => (
                        <div key={post.id} className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
                            <p className="font-bold text-white mb-4">
                                {authorMap[post.id] ? (
                                    <Link href={authorMap[post.id].type === 'character' ? `/characters/${authorMap[post.id].id}` : `/users/${authorMap[post.id].name}`} className="hover:text-purple-400">
                                        {authorMap[post.id].name}
                                    </Link>
                                ) : 'System'}
                            </p>
                            <div className="prose prose-invert lg:prose-xl" dangerouslySetInnerHTML={{ __html: post.attributes.contentHtml }} />
                        </div>
                    )) : (
                        <div className="bg-gray-800/50 p-6 rounded-lg text-center text-gray-400">
                            <h2 className="text-xl font-semibold text-white">This story is just beginning.</h2>
                            <p className="mt-2">There are no posts here yet. Be the first to write!</p>
                        </div>
                    )}
                </div>

                {/* --- THIS IS THE FINAL FIX --- */}
                <div className="mt-8">
                    {/* Condition 1: Check if the user is logged in */}
                    {loggedInUser && (
                        // Condition 2: Check that the OOC status has been determined (is not null)
                        isOocThread !== null && (
                            <ReplyForm
                                topicId={topicId}
                                myCharacters={myCharacters}
                                onReply={fetchPageData}
                                isOoc={isOocThread}
                            />
                        )
                    )}
                    {/* If the user is not logged in, show the login prompt */}
                    {!loggedInUser && (
                         <p className="text-center text-lg p-8 bg-gray-800/50 rounded-lg">
                            <Link href="/login" className="text-purple-400 font-bold hover:underline">Log in</Link> to post a reply.
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}