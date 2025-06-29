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
  const [isLoading, setIsLoading] = useState(true);
  const [isOocThread, setIsOocThread] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPageData = async () => {
    if (!topicId) return;
    setIsLoading(true);
    setError(null);
    try {
      // Step 1: Get basic post data and OOC status
      const postsRes = await fetch(`http://localhost:3001/api/v1/story/posts?topicId=${topicId}`);
      if (!postsRes.ok) throw new Error('Could not fetch posts.');
      const postData = await postsRes.json();
      const allPosts = postData.posts || [];
      
      setPosts(allPosts);
      setIsOocThread(postData.isOocThread);
      
      const postIds = allPosts.map((p: any) => p.id);
      if (postIds.length === 0) {
        setIsLoading(false);
        return;
      }

      // Step 2: Get all character authors for these posts
      const authorsRes = await fetch(`http://localhost:3001/api/v1/story/posts/authors?postIds=${postIds.join(',')}`);
      const characterAuthorData = await authorsRes.json();
      
      let finalAuthorMap = { ...characterAuthorData };
      let oocFlarumIds = new Set<string>();

      // Step 3: Identify which OOC authors we need to look up
      allPosts.forEach((post: any) => {
        if (!finalAuthorMap[post.id] && post.relationships?.user?.data) {
          oocFlarumIds.add(post.relationships.user.data.id);
        }
      });
      
      // Step 4: Use your working /users endpoint to get usernames for the OOC authors
      if (oocFlarumIds.size > 0) {
        const usersRes = await fetch(`http://localhost:3001/api/v1/users/from-flarum-ids`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flarumIds: Array.from(oocFlarumIds) }),
        });
        const usernameMap = await usersRes.json();

        // Step 5: Add the correct OOC authors to our final map
        allPosts.forEach((post: any) => {
            if (!finalAuthorMap[post.id] && post.relationships?.user?.data) {
                const flarumId = post.relationships.user.data.id;
                if (usernameMap[flarumId]) {
                    finalAuthorMap[post.id] = { type: 'user', name: usernameMap[flarumId], id: flarumId };
                }
            }
        });
      }

      setAuthorMap(finalAuthorMap);

      if (loggedInUser) {
        const myProfileRes = await fetch(`http://localhost:3001/api/v1/profiles/${loggedInUser.username}`);
        if (myProfileRes.ok) {
            setMyCharacters((await myProfileRes.json()).characters);
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, [topicId, token]);

  if (isLoading) return <p className="p-24 text-white">Loading Topic...</p>;
  if (error) return <p className="p-24 text-red-500">{`Error: ${error}`}</p>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-purple-400">Viewing Topic</h1>
        <div className="space-y-6">
          {posts.map((post) => {
            const author = authorMap[post.id];
            return (
              <div key={post.id} className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
                <p className="font-bold text-white mb-4">
                  {author ? (
                    author.type === 'character' ? (
                      <Link href={`/characters/${author.id}`} className="hover:text-purple-400">{author.name}</Link>
                    ) : (
                      <span className="italic">{author.name}</span>
                    )
                  ) : 'System'}
                </p>
                <div
                  className="prose prose-invert lg:prose-xl"
                  dangerouslySetInnerHTML={{ __html: post.attributes.contentHtml }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-8">
          {loggedInUser ? (
            <ReplyForm topicId={topicId} myCharacters={myCharacters} onReply={fetchPageData} isOoc={isOocThread} />
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