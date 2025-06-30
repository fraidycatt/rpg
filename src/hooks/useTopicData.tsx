// src/hooks/useTopicData.ts

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

// Define the shape of our data
export interface TopicData {
  posts: any[];
  authorMap: any;
  isOocThread: boolean;
  myCharacters: any[];
}

export function useTopicData(topicId: string) {
  const { user, token } = useAuth();
  const [data, setData] = useState<TopicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // We wrap our fetch logic in useCallback to ensure it's stable
  const fetchData = useCallback(async () => {
    // Don't fetch if we don't have the necessary info
    if (!topicId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch the main page data
      const topicRes = await fetch(`http://localhost:3001/api/v1/story/topic-page-data/${topicId}`);
      if (!topicRes.ok) throw new Error('Failed to fetch topic data.');
      const topicData = await topicRes.json();

      let characters: any[] = [];
      // If a user is logged in, also fetch their characters
      if (user?.username && token) {
        const profileRes = await fetch(`http://localhost:3001/api/v1/profiles/${user.username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          characters = profileData.characters || [];
        }
      }

      // Set all our data in one go
      setData({
        posts: topicData.posts || [],
        authorMap: topicData.authorMap || {},
        isOocThread: topicData.isOocThread || false,
        myCharacters: characters,
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [topicId, user?.username, token]); // The dependencies are stable

  // The main effect to trigger the fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Return everything the component needs, including a way to refetch
  return { data, isLoading, error, refetch: fetchData };
}