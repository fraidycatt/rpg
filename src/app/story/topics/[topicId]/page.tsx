'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import ReplyForm from '@/components/ReplyForm';

export default function TopicPage(props: { params: { topicId: string } }) {
  const { topicId } = use(props.params);
  const { user: loggedInUser } = useAuth();

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
      const res = await fetch(`http://localhost:3001/api/v1/story/topic-page-data/${topicId}`);
      if (!res.ok) throw new Error('Failed to fetch topic data');
      const data = await res.json();

      setPosts(data.posts);
      setAuthorMap(data.authorMap);
      setIsOocThread(data.isOocThread);

      if (loggedInUser) {
        const myProfileRes = await fetch(`http://localhost:3001/api/v1/profiles/${loggedInUser.username}`);
        if (myProfileRes.ok) {
            const myProfileData = await myProfileRes.json();
            setMyCharacters(myProfileData.characters);
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
  }, [topicId, loggedInUser]);

  if (isLoading) return <p className="p-24 text-white">Loading Topic...</p>;
  if (error) return <p className="p-24 text-red-500">{error}</p>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-purple-400">Viewing Topic</h1>
        <div className="space-y-6">
          {posts.map((post) => {
            const author = authorMap[post.id];
            return (
              <div key={post.id} className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
                <div className="font-bold text-white mb-4">
                  {author ? (
                    author.type === 'character' ? (
                      <Link href={`/characters/${author.id}`} className="hover:text-purple-400">{author.name}</Link>
                    ) : (
                      <span className="italic">{author.name}</span>
                    )
                  ) : 'System'}
                </div>
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
