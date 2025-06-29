'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import ReplyForm from '@/components/ReplyForm';

export default function TopicPage(props: { params: { topicId: string } }) {
  const { topicId } = use(props.params);
  const { user: loggedInUser, token } = useAuth();

  const [posts, setPosts] = useState<any[]>([]);
  const [authorMap, setAuthorMap] = useState<any>({});
  const [myCharacters, setMyCharacters] = useState<any[]>([]);
  const [flarumUserMap, setFlarumUserMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect 1: Fetch the core topic data (posts and authors)
  useEffect(() => {
    const fetchTopicPosts = async () => {
      if (!topicId) return;

      setIsLoading(true);
      setError(null);

      try {
        // STEP 1: Get the raw post and user data from the custom API endpoint
        const postsRes = await fetch(`http://localhost:3001/api/v1/story/posts?topicId=${topicId}`);
        if (!postsRes.ok) throw new Error('Failed to fetch topic data.');
        
        const postData = await postsRes.json();
        
        // Use the 'posts' array from your custom API, not 'data'
        const fetchedPosts = postData.posts || []; 
        setPosts(fetchedPosts);
        
        // Build the Flarum user map from the 'included' data for OOC authors
        const includedUsers = postData.included?.filter((i: any) => i.type === 'users') || [];
        const userMap: Record<string, string> = {};
        includedUsers.forEach((user: any) => {
          userMap[user.id] = user.attributes.username;
        });
        setFlarumUserMap(userMap);

        // STEP 2: Get the Character author data from our dedicated backend endpoint
        if (fetchedPosts.length > 0) {
          const postIds = fetchedPosts.map((p: any) => p.id).join(',');
          const authorsRes = await fetch(`http://localhost:3001/api/v1/story/posts/authors?postIds=${postIds}`);
          if (authorsRes.ok) {
            const authorsData = await authorsRes.json();
            setAuthorMap(authorsData);
          }
        }

      } catch (e: any) {
        setError(e.message);
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopicPosts();
  }, [topicId]);

  // Effect 2: Fetch user's own characters for the reply form
  useEffect(() => {
    const fetchMyCharacters = async () => {
      if (loggedInUser && token) {
        try {
          const myProfileRes = await fetch(`http://localhost:3001/api/v1/profiles/${loggedInUser.username}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (myProfileRes.ok) {
            const myProfileData = await myProfileRes.json();
            setMyCharacters(myProfileData.characters);
          }
        } catch (e: any) {
          console.error("Failed to fetch user's characters:", e);
        }
      }
    };
    fetchMyCharacters();
  }, [loggedInUser, token]);

  if (isLoading) return <p className="p-24 text-white">Loading Topic...</p>;
  if (error) return <p className="p-24 text-red-400">Error: {error}</p>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-purple-400">Viewing Topic</h1>
        <div className="space-y-6">
          {posts.length > 0 ? posts.map((post) => {
            // Check for Character author first
            const characterAuthor = authorMap[post.id];
            
            // Then, check for a Flarum User author
            const flarumUserId = post.relationships?.user?.data?.id;
            const userAuthorUsername = flarumUserId ? flarumUserMap[flarumUserId] : null;

            return (
              <div key={post.id} className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
                <p className="font-bold text-white mb-4">
                  {characterAuthor ? (
                    <Link href={`/characters/${characterAuthor.id}`} className="hover:text-purple-400">{characterAuthor.character_name}</Link>
                  ) : userAuthorUsername ? (
                     <Link href={`/users/${userAuthorUsername}`} className="hover:text-purple-400">{userAuthorUsername}</Link>
                  ) : ( 'System' )}
                </p>
                {/* --- THE CONTENT FIX --- */}
                {/* The HTML is inside `post.attributes.contentHtml` */}
                <div className="prose prose-invert lg:prose-xl" dangerouslySetInnerHTML={{ __html: post.attributes.contentHtml }} />
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
            <ReplyForm topicId={topicId} myCharacters={myCharacters} />
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