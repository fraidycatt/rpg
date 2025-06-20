'use client';

// 1. We now import 'use' from React, alongside the other hooks.
import { useState, useEffect, use } from 'react';

type PageProps = {
  params: {
    pageTitle: string;
  }
};

// 2. We will receive the entire 'props' object instead of destructuring it immediately.
export default function WikiArticlePage(props: PageProps) {

  // --- The React.use() Fix ---
  // 3. We pass the props.params object into the 'use' hook to get the
  //    resolved value, exactly as the error message suggests.
  const resolvedParams = use(props.params);
  const pageTitle = decodeURIComponent(resolvedParams.pageTitle);

  // The rest of the component logic remains the same.
  const [articleHtml, setArticleHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/v1/wiki/${pageTitle}`);
        if (!res.ok) {
          throw new Error(`The article "${pageTitle.replace(/_/g, ' ')}" could not be found.`);
        }
        const data = await res.json();
        setArticleHtml(data.html);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [pageTitle]);

  if (isLoading) {
    return <p className="p-24 text-white">Loading article...</p>;
  }

  if (error) {
    return <p className="p-24 text-red-400">Error: {error}</p>;
  }

  return (
    <main className="flex justify-center p-8 sm:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-5xl">
        <article
          className="prose prose-invert lg:prose-xl"
          dangerouslySetInnerHTML={{ __html: articleHtml }}
        />
      </div>
    </main>
  );
}