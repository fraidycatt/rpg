'use client';

import { useState, useEffect, use } from 'react';

export default function TopicPage(props: { params: { topicId: string } }) {
    const { topicId } = use(props.params);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getTheTruth = async () => {
            if (!topicId) return;

            console.log(`--- DIAGNOSTIC MODE ---`);
            console.log(`Fetching data for topicId: ${topicId}`);

            try {
                const res = await fetch(`http://localhost:3001/api/v1/story/posts?topicId=${topicId}`);
                
                if (!res.ok) {
                    throw new Error(`Server responded with status: ${res.status}`);
                }

                const data = await res.json();

                console.log('--- !!! THE ACTUAL DATA FROM YOUR BACKEND !!! ---');
                console.log(data); // This is the most important log.
                console.log('--- !!! END OF DATA !!! ---');

            } catch (e: any) {
                setError(e.message);
                console.error("--- FETCH FAILED ---", e);
            } finally {
                setIsLoading(false);
            }
        };

        getTheTruth();
    }, [topicId]);

    if (isLoading) {
        return <p className="p-24 text-white">Fetching diagnostic data...</p>;
    }

    if (error) {
        return <p className="p-24 text-red-500">Error during diagnostics: {error}</p>;
    }

    return (
        <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
            <div className="w-full max-w-4xl text-center">
                <h1 className="text-3xl font-bold mb-4 text-yellow-400">Diagnostic Mode</h1>
                <p className="text-lg">Please open the browser console (F12), copy the object logged between the "THE ACTUAL DATA" lines, and paste it in our chat.</p>
                <p className="text-sm mt-2">No posts will be displayed on this page.</p>
            </div>
        </main>
    );
}