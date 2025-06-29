'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import ReplyForm from '@/components/ReplyForm';

// A new, simpler reply form for OOC threads
function OocReplyForm({ topicId }: { topicId: string }) {
  const { token } = useAuth();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!content.trim()) {
      setError('You cannot post an empty reply.');
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:3001/api/v1/story/posts/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        // For OOC posts, we do NOT send a characterId
        body: JSON.stringify({ content, topicId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to post reply.');
      }

      setContent('');
      alert('Reply posted successfully! The page will now refresh.');
      window.location.reload();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg mt-8 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Post a Reply (As User)</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reply-content" className="block text-sm font-medium text-gray-300">Your Post:</label>
          <textarea
            id="reply-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 p-2 bg-gray-900 border border-gray-600 rounded-md text-white"
            placeholder="Write your reply..."
            disabled={isSubmitting}
            required
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="py-2 px-6 border border-transparent rounded-md shadow-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Submit Reply'}
        </button>
      </form>
    </div>
  );
}


export default function TopicPage(props: { params: { topicId: string } }) {
    const { topicId } = use(props.params);
    const { user: loggedInUser, token } = useAuth();

    const [posts, setPosts] = useState<any[]>([]);
    const [isOocThread, setIsOocThread] = useState(false); // State to hold the OOC flag
    const [characterAuthorMap, setCharacterAuthorMap] = useState<any>({});
    const [flarumUserMap, setFlarumUserMap] = useState<Record<string, string>>({});
    const [myCharacters, setMyCharacters] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // This single, robust effect fetches all necessary data.
    useEffect(() => {
        const fetchPageData = async () => {
            if (!topicId) return;

            setIsLoading(true);
            setError(null);

            try {
                // STEP 1: Get the topic data, which includes raw posts and the OOC flag.
                const topicRes = await fetch(`http://localhost:3001/api/v1/story/posts?topicId=${topicId}`);
                if (!topicRes.ok) throw new Error('Failed to fetch the topic data from the server.');

                const topicData = await topicRes.json();
                
                const fetchedPosts = topicData.posts || [];
                setPosts(fetchedPosts);
                setIsOocThread(topicData.isOocThread || false); // Correctly set the OOC flag

                // Build a map of Flarum User ID -> Flarum Username for all posts.
                const includedUsers = topicData.included?.filter((i: any) => i.type === 'users') || [];
                const userMap: Record<string, string> = {};
                includedUsers.forEach((user: any) => {
                    userMap[user.id] = user.attributes.username;
                });
                setFlarumUserMap(userMap);

                // STEP 2: If it's an In-Character thread, fetch the character authors.
                if (fetchedPosts.length > 0 && !topicData.isOocThread) {
                    const postIds = fetchedPosts.map((p: any) => p.id).join(',');
                    const authorsRes = await fetch(`http://localhost:3001/api/v1/story/posts/authors?postIds=${postIds}`);
                    if (authorsRes.ok) {
                        const authorsData = await authorsRes.json();
                        setCharacterAuthorMap(authorsData);
                    }
                }

                // STEP 3: Fetch the logged-in user's characters for the IC reply form.
                if (loggedInUser && token) {
                    const myProfileRes = await fetch(`http://localhost:3001/api/v1/profiles/${loggedInUser.username}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (myProfileRes.ok) {
                        const myProfileData = await myProfileRes.json();
                        setMyCharacters(myProfileData.characters);
                    }
                }

            } catch (e: any) {
                setError(e.message);
                console.error("A critical error occurred while fetching page data:", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPageData();
    }, [topicId, loggedInUser, token]);


    if (isLoading) return <p className="p-24 text-white">Loading Topic...</p>;
    if (error) return <p className="p-24 text-red-400">Error: {error}</p>;

    return (
        <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
            <div className="w-full max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-purple-400">Viewing Topic</h1>
                <div className="space-y-6">
                    {posts.length > 0 ? posts.map((post) => {
                        // This logic is now definitive.
                        const characterAuthor = characterAuthorMap[post.id];
                        const flarumUserId = post.relationships?.user?.data?.id;
                        const userAuthorUsername = flarumUserId ? flarumUserMap[flarumUserId] : null;

                        return (
                            <div key={post.id} className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
                                <p className="font-bold text-white mb-4">
                                    {/* For IC posts, character author is priority */}
                                    {characterAuthor ? (
                                        <Link href={`/characters/${characterAuthor.id}`} className="hover:text-purple-400">{characterAuthor.character_name}</Link>
                                    // For OOC posts, we show the Flarum user
                                    ) : userAuthorUsername ? (
                                        <Link href={`/users/${userAuthorUsername}`} className="hover:text-purple-400">{userAuthorUsername}</Link>
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
                    {/* --- THE REPLY FORM FIX --- */}
                    {/* We now use the `isOocThread` flag to show the correct form. */}
                    {loggedInUser && isOocThread && <OocReplyForm topicId={topicId} />}
                    {loggedInUser && !isOocThread && <ReplyForm topicId={topicId} myCharacters={myCharacters} />}
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