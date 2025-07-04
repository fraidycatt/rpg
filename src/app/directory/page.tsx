// src/app/directory/page.tsx

'use client';

import { useState } from 'react';
import CharacterDirectory from '@/components/CharacterDirectory';
import UserDirectory from '@/components/UserDirectory';

export default function DirectoryPage() {
    // State to manage which directory view is active. 'characters' is the default.
    const [activeView, setActiveView] = useState('characters');

    return (
        <main className="flex min-h-screen flex-col items-center p-8 sm:p-12 bg-gray-900 text-white">
            <div className="w-full max-w-7xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-yellow-300 tracking-wider" style={{ fontFamily: 'serif' }}>
                        The Directory
                    </h1>
                    <p className="text-lg text-gray-400 mt-2">Find characters to write with and players to connect with.</p>
                </div>

                {/* --- View Toggle Buttons --- */}
                <div className="flex justify-center mb-8 border-b border-gray-700">
                    <button
                        onClick={() => setActiveView('characters')}
                        className={`py-2 px-6 text-lg font-medium transition-colors ${activeView === 'characters' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        Characters
                    </button>
                    <button
                        onClick={() => setActiveView('users')}
                        className={`py-2 px-6 text-lg font-medium transition-colors ${activeView === 'users' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        Players
                    </button>
                </div>

                {/* --- Conditional Rendering of the Active View --- */}
                <div>
                    {activeView === 'characters' && <CharacterDirectory />}
                    {activeView === 'users' && <UserDirectory />}
                </div>
            </div>
        </main>
    );
}