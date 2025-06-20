// This is our last attempt to force Next.js to render this page dynamically.
export const dynamic = 'force-dynamic';

// Define the shape of our props for TypeScript
type PageProps = {
  params: {
    pageTitle: string;
  }
};

export default async function WikiArticlePage({ params }: PageProps) {
  // Let's log right at the beginning to see what we receive
  console.log("--- WIKI PAGE RENDER STARTED ---");
  console.log("Received params object:", params);

  try {
    // We will now wrap everything in a try...catch block to handle errors gracefully.
    
    // This is the line the error pointed to. Let's see if we get past it.
    const pageTitle = decodeURIComponent(params.pageTitle);
    console.log(`Step 1: Successfully decoded page title: ${pageTitle}`);

    // Construct the URL to your live wiki.
    // IMPORTANT: Make sure this URL is correct.
    const wikiApiUrl = `https://wiki.maryeliston.com/api.php?action=parse&page=${pageTitle}&format=json&prop=text&disableeditsection=true&disabletoc=true&disablelimitreport=true`;
    console.log(`Step 2: Fetching from URL: ${wikiApiUrl}`);

    // Fetch the data from the MediaWiki API
    const res = await fetch(wikiApiUrl, { cache: 'no-store' });
    console.log(`Step 3: Fetch response status: ${res.status}`);

    // Check if the network request itself was successful
    if (!res.ok) {
      throw new Error(`API fetch failed with status: ${res.status}`);
    }

    const data = await res.json();
    console.log("Step 4: Successfully received JSON data from API.");
    
    // Check if the data contains the text we need
    if (!data.parse || !data.parse.text) {
      throw new Error("API response is missing expected 'parse.text' property.");
    }

    const articleHtml = data.parse.text['*'];
    console.log("--- RENDER SUCCESSFUL, HTML IS READY ---");

    // If we get here, everything worked. Now we render the page.
    return (
      <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
        <div className="w-full max-w-5xl">
          <article 
            className="prose prose-invert lg:prose-xl"
            dangerouslySetInnerHTML={{ __html: articleHtml }}
          />
        </div>
      </main>
    );

  } catch (error) {
    // If ANY of the steps in the 'try' block fail, we will land here.
    console.error("--- AN ERROR OCCURRED DURING PAGE RENDER ---", error);
    return (
      <main className="p-24 text-red-500">
        <h1 className="text-2xl">An error occurred while loading this article.</h1>
        <p>Please check the server terminal for more details.</p>
      </main>
    );
  }
}