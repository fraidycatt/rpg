// This is the new, crucial line!
// It tells Next.js: "Always render this page fresh for every request."
// This resolves the timing issue with the 'params' object.
export const dynamic = 'force-dynamic';

// We can now use our original, clean component code because the 'params'
// will be correctly resolved before this function is called.

type PageProps = {
  params: {
    pageTitle: string;
  }
};

async function getArticle(title: string) {
  const mediaWikiApiUrl = `https://wiki.maryeliston.com/api.php`; // Make sure this is your URL
  const searchParams = new URLSearchParams({
    action: 'parse',
    page: title,
    format: 'json',
    prop: 'text',
    disableeditsection: 'true',
    disabletoc: 'true',
    disablelimitreport: 'true',
  });

  try {
    const res = await fetch(`${mediaWikiApiUrl}?${searchParams.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch article');
    
    const data = await res.json();
    if (!data.parse || !data.parse.text) throw new Error('Article content not found');
    
    // The HTML from the API is NOT escaped, so we don't need the 'he' library.
    return data.parse.text['*'];
  } catch (error) {
    console.error(error);
    return `<div class="text-red-500">Could not load article: ${title}.</div>`;
  }
}

export default async function WikiArticlePage({ params }: PageProps) {
  const pageTitle = decodeURIComponent(params.pageTitle);
  const articleHtml = await getArticle(pageTitle);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
      {/* The prose classes have been moved to this parent div */}
<div className="w-full max-w-5xl prose prose-invert lg:prose-xl">
  {/* This article tag now has no classes of its own */}
  <article 
    dangerouslySetInnerHTML={{ __html: articleHtml }}
  />
</div>
    </main>
  );
}