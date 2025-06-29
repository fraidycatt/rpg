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

  useEffect(() => {
    const fetchTopicPosts = async () => {
      if (!topicId) return;

      setIsLoading(true);
      setError(null);

      try {
        const postsRes = await fetch(`http://localhost:3001/api/v1/story/posts?topicId=${topicId}`);
        if (!postsRes.ok) {
          throw new Error(`The server responded with an error: ${postsRes.status}`);
        }

        const postData = await postsRes.json();
        
        // --- THE FIX ---
        // We now correctly look for the 'posts' property from your API response,
        // instead of the 'data' property that Flarum's default endpoint uses.
        const fetchedPosts = postData.posts || [];
        setPosts(fetchedPosts);

        // Since the backend now handles author mapping, we can simplify this.
        // We'll create the authorMap directly from the `author` object in each post.
        const charAuthorMap: any = {};
        const userAuthorMap: any = {};
        
        fetchedPosts.forEach(post => {
          if (post.author) {
            // Check if it's a character or a user and place them in the correct map
            if (post.author.type === 'character') {
              charAuthorMap[post.id] = post.author;
            } else if (post.author.type === 'user') {
              userAuthorMap[post.id] = post.author;
            }
          }
        });

        setAuthorMap(charAuthorMap);
        setFlarumUserMap(userAuthorMap);

      } catch (e: any) {
        console.error("Fetch failed:", e);
        setError(`A network error occurred: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopicPosts();
  }, [topicId]);

  useEffect(() => {
    if (loggedInUser && token) {
      const fetchMyCharacters = async () => {
        try {
          const myProfileRes = await fetch(`http://localhost:3001/api/v1/profiles/${loggedInUser.username}`, { headers: { 'Authorization': `Bearer ${token}` }});
          if (myProfileRes.ok) {
            const myProfileData = await myProfileRes.json();
            setMyCharacters(myProfileData.characters);
          }
        } catch (e) { console.error("Failed to fetch user's characters:", e); }
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
            // We now look in two different maps depending on the post type
            const characterAuthor = authorMap[post.id];
            const userAuthor = flarumUserMap[post.id];

            return (
              <div key={post.id} className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
                <p className="font-bold text-white mb-4">
                  {characterAuthor ? (
                    <Link href={`/characters/${characterAuthor.id}`} className="hover:text-purple-400">{characterAuthor.character_name}</Link>
                  ) : userAuthor ? (
                     <Link href={`/users/${userAuthor.username}`} className="hover:text-purple-400">{userAuthor.username}</Link>
                  ) : ( 'System' )}
                </p>
                <div className="prose prose-invert lg:prose-xl" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
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