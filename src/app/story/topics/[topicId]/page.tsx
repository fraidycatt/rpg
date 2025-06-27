'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import ReplyForm from '@/components/ReplyForm';
import EditPostForm from '@/components/EditPostForm'; // <-- 1. IMPORT THE NEW COMPONENT
import EditBeatsForm from '@/components/EditBeatsForm';

export default function TopicPage(props: { params: { topicId: string } }) {
  const { topicId } = use(props.params);
  const { user: loggedInUser, token } = useAuth();

  const [posts, setPosts] = useState<any[]>([]);
  const [authorMap, setAuthorMap] = useState<any>({});
  const [topicAuthorId, setTopicAuthorId] = useState<string | null>(null);
  const [myCharacters, setMyCharacters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isEditingBeats, setIsEditingBeats] = useState(false);

  const fetchPageData = async () => {
    if (!topicId) return;
    try {
      const postsRes = await fetch(`http://localhost:3001/api/v1/story/posts?topicId=${topicId}`);
      if (!postsRes.ok) throw new Error('Failed to fetch posts');
      const postData = await postsRes.json();
      setPosts(postData.data);

      const discussionData = postData.included?.find((item: any) => item.type === 'discussions' && item.id === topicId);
      if (discussionData) {
        setTopicAuthorId(discussionData.relationships.user.data.id);
      }

      if (postData.data.length > 0) {
        const postIds = postData.data.map((p: any) => p.id).join(',');
        const authorsRes = await fetch(`http://localhost:3001/api/v1/story/posts/authors?postIds=${postIds}`);
        if (!authorsRes.ok) throw new Error('Failed to fetch post authors');
        const authorsData = await authorsRes.json();
        setAuthorMap(authorsData);
      }

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
  
  // This useEffect fetches the initial data
  useEffect(() => {
    fetchPageData();
  }, [topicId, loggedInUser]);

  // --- 3. ADD HANDLER FUNCTIONS ---
  const handleEditSuccess = () => {
    setEditingPostId(null); // Close the form
    fetchPageData();      // Re-fetch the data to show the updated post
  };

  const canEditBeats = loggedInUser && loggedInUser.flarum_id?.toString() === topicAuthorId;

  if (isLoading) return <p className="p-24 text-white">Loading Topic...</p>;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-purple-400">Viewing Topic</h1>
            {canEditBeats && (
                <button onClick={() => setIsEditingBeats(true)} className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">
                    Edit Genres
                </button>
            )}
        </div>

        {isEditingBeats && (
            <EditBeatsForm 
                discussionId={topicId}
                onSave={() => setIsEditingBeats(false)}
                onCancel={() => setIsEditingBeats(false)}
            />
        )}
        <div className="space-y-6">
          {posts.map((post) => {
            const characterAuthor = authorMap[post.id];
            // Determine if the current logged-in user can edit this post
            const canEdit = loggedInUser && characterAuthor && characterAuthor.user_id === loggedInUser.userId;

            return (
              <div key={post.id} className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-white mb-4">
                    {characterAuthor ? (
                      <Link href={`/characters/${characterAuthor.id}`} className="hover:text-purple-400">
                        {characterAuthor.character_name}
                      </Link>
                    ) : ( 'System' )}
                  </div>
                  {/* --- 4. ADD THE EDIT BUTTON --- */}
                  {canEdit && editingPostId !== post.id && (
                    <button onClick={() => setEditingPostId(post.id)} className="text-xs text-gray-400 hover:text-white">
                      Edit
                    </button>
                  )}
                </div>

                {/* --- 5. CONDITIONALLY RENDER THE POST OR THE FORM --- */}
                {editingPostId === post.id ? (
                  <EditPostForm 
                    postId={post.id}
                    initialContent={post.attributes.content} // Pass the raw content, not the HTML
                    onSave={handleEditSuccess}
                    onCancel={() => setEditingPostId(null)}
                  />
                ) : (
                  <div
                    className="prose prose-invert lg:prose-xl"
                    dangerouslySetInnerHTML={{ __html: post.attributes.contentHtml }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          {loggedInUser ? (
            <ReplyForm topicId={topicId} myCharacters={myCharacters} onReply={fetchPageData} />
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

// And finally, a small change to ReplyForm to accept the onReply prop
// In src/components/ReplyForm.tsx
interface ReplyFormProps {
    topicId: string;
    myCharacters: any[]; // Use a more specific type if you have one
    onReply: () => void; // <-- ADD THIS LINE
}