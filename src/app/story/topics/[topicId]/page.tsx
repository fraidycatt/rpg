'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ReplyForm from '@/components/ReplyForm';
import OocReplyForm from '@/components/OocReplyForm';

export default function TopicPage(props: { params: { topicId: string } }) {
    const { topicId } = use(props.params);
    const { user: loggedInUser, token } = useAuth();

    const [posts, setPosts] = useState<any[]>([]);
    const [isOocThread, setIsOocThread] = useState(false);
    const [characterAuthorMap, setCharacterAuthorMap] = useState<any>({});
    const [flarumUserMap, setFlarumUserMap] = useState<Record<string, { username: string }>>({});
    const [myCharacters, setMyCharacters] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPageData = async () => {
            if (!topicId) return;
            setIsLoading(true);
            setError(null);
            try {
                // This single fetch will now receive the complete data from your fixed backend.
                const topicRes = await fetch(`http://localhost:3001/api/v1/story/posts?topicId=${topicId}`);
                if (!topicRes.ok) throw new Error('Failed to fetch topic data.');
                const topicData = await topicRes.json();

                const fetchedPosts = topicData.posts || [];
                setPosts(fetchedPosts);
                setIsOocThread(topicData.isOocThread);

                // This logic will now succeed because `topicData.included` will exist and contain users.
                const userMap: Record<string, { username: string }> = {};
                (topicData.included || [])
                    .forEach((user: any) => {
                        userMap[user.id] = { username: user.attributes.username };
                    });
                setFlarumUserMap(userMap);

                // For IC threads, fetch character authors separately.
                if (fetchedPosts.length > 0 && !topicData.isOocThread) {
                    const postIds = fetchedPosts.map((p: any) => p.id).join(',');
                    const authorsRes = await fetch(`http://localhost:3001/api/v1/story/posts/authors?postIds=${postIds}`);
                    if (authorsRes.ok) {
                        const authorsData = await authorsRes.json();
                        setCharacterAuthorMap(authorsData);
                    }
                }
            } catch (e: any) {
                setError(e.message);
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPageData();
    }, [topicId]);

    // This separate effect for the reply form is correct.
    useEffect(() => {
        if (loggedInUser && token) {
            const fetchMyCharacters = async () => {
                const myProfileRes = await fetch(`http://localhost:3001/api/v1/profiles/${loggedInUser.username}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (myProfileRes.ok) {
                    const myProfileData = await myProfileRes.json();
                    setMyCharacters(myProfileData.characters);
                }
            };
            fetchMyCharacters();
        }
    }, [loggedInUser, token]);

    if (isLoading) return <p className="p-24 text-white">Loading Topic...</p>;
    if (error) return <p className="p-24 text-red-400">Error: {error}</p>;

    return (
        <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
            <div className="w-full max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-purple-400">Viewing Topic</h1>
                <div className="space-y-6">
                    {posts.length > 0 ? posts.map((post) => {
                        // This author logic will now finally work.
                        const characterAuthor = characterAuthorMap[post.id];
                        const flarumUserId = post.relationships?.user?.data?.id;
                        const userAuthor = flarumUserId ? flarumUserMap[flarumUserId] : null;

                        return (
                            <div key={post.id} className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
                                <p className="font-bold text-white mb-4">
                                    {characterAuthor ? (
                                        <Link href={`/characters/${characterAuthor.id}`} className="hover:text-purple-400">{characterAuthor.character_name}</Link>
                                    ) : userAuthor ? (
                                        <Link href={`/users/${userAuthor.username}`} className="hover:text-purple-400">{userAuthor.username}</Link>
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
                    {loggedInUser && (
                        isOocThread 
                            ? <OocReplyForm topicId={topicId} />
                            : <ReplyForm topicId={topicId} myCharacters={myCharacters} />
                    )}
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