'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import ReplyForm from '@/components/ReplyForm';

export default function TopicPage(props: { params: { topicId: string } }) {
  const { topicId } = use(props.params);
  const { user: loggedInUser, token } = useAuth();

  // We have separate state for all our different data sources
  const [posts, setPosts] = useState<any[]>([]);
  const [authorMap, setAuthorMap] = useState<any>({});
  const [myCharacters, setMyCharacters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      if (!topicId) return;
      try {
        // 1. Fetch the posts from Flarum
        const postsRes = await fetch(`http://localhost:3001/api/v1/story/posts?topicId=${topicId}`);
        if (!postsRes.ok) throw new Error('Failed to fetch posts');
        const postData = await postsRes.json();
        const fetchedPosts = postData.data;
        setPosts(fetchedPosts);

        // 2. If we got posts, get their real character authors from our custom backend
        if (fetchedPosts.length > 0) {
          const postIds = fetchedPosts.map((p: any) => p.id).join(',');
          const authorsRes = await fetch(`http://localhost:3001/api/v1/story/posts/authors?postIds=${postIds}`);
          if (!authorsRes.ok) throw new Error('Failed to fetch post authors');
          const authorsData = await authorsRes.json();
          setAuthorMap(authorsData);
        }

        // 3. If a user is logged in, get their list of characters for the reply form
        if (loggedInUser) {
          const myProfileRes = await fetch(`http://localhost:3001/api/v1/profiles/${loggedInUser.username}`);
          if (!myProfileRes.ok) throw new Error('Could not load your character list.');
          const myProfileData = await myProfileRes.json();
          setMyCharacters(myProfileData.characters);
        }

      } catch (e: any) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [topicId, loggedInUser]);

  if (isLoading) return <p className="p-24 text-white">Loading Topic...</p>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-purple-400">Viewing Topic</h1>
        <div className="space-y-6">
          {posts.map((post) => {
            // For each post, look up its real author in our authorMap
            const characterAuthor = authorMap[post.id];
            return (
              <div key={post.id} className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
                <p className="font-bold text-white mb-4">
                  {/* If we have a character author, display them. Otherwise, show nothing. */}
                  {characterAuthor ? (
                    <Link href={`/characters/${characterAuthor.id}`} className="hover:text-purple-400">
                      {characterAuthor.character_name}
                    </Link>
                  ) : (
                    'System' // Fallback for posts not made by a character
                  )}
                </p>
                <div
                  className="prose prose-invert lg:prose-xl"
                  dangerouslySetInnerHTML={{ __html: post.attributes.contentHtml }}
                />
              </div>
            );
          })}
        </div>

        {/* The new Reply Form, which gets the character list passed to it */}
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