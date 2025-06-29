'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

// Step 2: Adds User Author logic
export default function TopicPage(props: { params: { topicId: string } }) {
    const { topicId } = use(props.params);

    const [posts, setPosts] = useState<any[]>([]);
    // We add state for our new User Map
    const [flarumUserMap, setFlarumUserMap] = useState<Record<string, { username: string }>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!topicId) return;
            setIsLoading(true);
            setError(null);

            try {
                const res = await fetch(`http://localhost:3001/api/v1/story/posts?topicId=${topicId}`);
                if (!res.ok) {
                    throw new Error(`The server responded with status: ${res.status}`);
                }
                const data = await res.json();
                console.log("Step 2 Data:", data);

                setPosts(data.posts || []);

                // --- NEW LOGIC ---
                // Build the map of Flarum User ID -> Username from the 'included' data.
                const userMap: Record<string, { username: string }> = {};
                (data.included || [])
                    .filter((item: any) => item.type === 'users')
                    .forEach((user: any) => {
                        userMap[user.id] = { username: user.attributes.username };
                    });
                setFlarumUserMap(userMap);
                console.log("Built User Map:", userMap);
                // --- END NEW LOGIC ---

            } catch (e: any) {
                setError(e.message);
                console.error("Step 2 Fetch Failed:", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [topicId]);

    if (isLoading) {
        return <p className="p-24 text-white">Step 2: Loading user authors...</p>;
    }

    if (error) {
        return <p className="p-24 text-red-400">Step 2 Error: {error}</p>;
    }

    // The render logic is now updated to find the user author.
    return (
        <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
            <div className="w-full max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-purple-400">Topic Content (Step 2)</h1>
                <div className="space-y-6">
                    {posts.length > 0 ? posts.map((post) => {
                        
                        // --- NEW LOGIC ---
                        // Find the author's ID from the post's relationships.
                        const flarumUserId = post.relationships?.user?.data?.id;
                        // Look up the author in our new map.
                        const userAuthor = flarumUserId ? flarumUserMap[flarumUserId] : null;
                        // --- END NEW LOGIC ---

                        return (
                            <div key={post.id} className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
                               <p className="font-bold text-white mb-4">
                                    {/* If we find a user author, display their name. */}
                                    {/* Otherwise, fall back to the Post ID for debugging. */}
                                    {userAuthor ? (
                                        <Link href={`/users/${userAuthor.username}`} className="hover:text-purple-400">{userAuthor.username}</Link>
                                    ) : (
                                        <span className="text-sm text-gray-500">Post ID: {post.id} (No User Author Found)</span>
                                    )}
                                </p>
                                <div
                                    className="prose prose-invert lg:prose-xl"
                                    dangerouslySetInnerHTML={{ __html: post.attributes.contentHtml }}
                                />
                            </div>
                        );
                    }) : (
                        <p>No posts found for this topic.</p>
                    )}
                </div>
            </div>
        </main>
    );
}