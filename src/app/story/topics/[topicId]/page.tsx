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

  const fetchPageData = async () => {
    if (!topicId) return;
    try {
      // Step 1: Fetch the basic post and OOC data.
      const postsRes = await fetch(`http://localhost:3001/api/v1/story/posts?topicId=${topicId}`);
      const postData = await postsRes.json();
      setPosts(postData.data);
      setIsOocThread(postData.isOocThread);
      
      // Step 2: Fetch our custom character authors.
      const postIds = postData.data.map((p: any) => p.id).join(',');
      const authorsRes = await fetch(`http://localhost:3001/api/v1/story/posts/authors?postIds=${postIds}`);
      const characterAuthorData = await authorsRes.json();
      
      let finalAuthorMap = { ...characterAuthorData };
      let oocAuthorIdsToFetch = new Set();

      // Step 3: Identify which OOC authors we need to look up.
      postData.data.forEach((post: any) => {
        if (!finalAuthorMap[post.id] && post.relationships?.user?.data) {
          oocAuthorIdsToFetch.add(post.relationships.user.data.id);
        }
      });

      // Step 4: Fetch the usernames for the OOC authors from our new endpoint.
      if (oocAuthorIdsToFetch.size > 0) {
        const userLookups = Array.from(oocAuthorIdsToFetch).map(id =>
          fetch(`http://localhost:3001/api/v1/users/by-flarum-id/${id}`).then(res => res.json())
        );
        const userDataResults = await Promise.all(userLookups);
        
        const flarumIdToUsernameMap = userDataResults.reduce((map: any, user: any, index: number) => {
            const flarumId = Array.from(oocAuthorIdsToFetch)[index];
            map[flarumId] = user.username;
            return map;
        }, {});

        // Step 5: Add the OOC authors to our final map.
        postData.data.forEach((post: any) => {
            if (!finalAuthorMap[post.id] && post.relationships?.user?.data) {
                const flarumId = post.relationships.user.data.id;
                finalAuthorMap[post.id] = {
                    type: 'user',
                    name: flarumIdToUsernameMap[flarumId] || 'A User',
                    id: flarumId
                };
            }
        });
      }

      setAuthorMap(finalAuthorMap);

      // Step 6: Fetch the logged-in user's characters for the reply form.
      if (loggedInUser) {
        const myProfileRes = await fetch(`http://localhost:3001/api/v1/profiles/${loggedInUser.username}`);
        if (myProfileRes.ok) {
            const myProfileData = await myProfileRes.json();
            setMyCharacters(myProfileData.characters);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, [topicId, loggedInUser]);

  if (isLoading) return <p className="p-24 text-white">Loading Topic...</p>;

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
                      <Link href={`/characters/${author.id}`} className="hover:text-purple-400">{author.character_name}</Link>
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
