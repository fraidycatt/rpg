'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const [isUserCpOpen, setIsUserCpOpen] = useState(false);

  useEffect(() => {
    if (isUserCpOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isUserCpOpen]);

  return (
    <div>
        <header className="bg-gray-800/30 backdrop-blur-sm p-4 sticky top-0 z-40 border-b border-gray-700/50">
            <nav className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Site Logo and Main Nav remain the same */}
            <Link href="/" className="text-2xl font-bold text-white hover:text-purple-400 transition-colors">
                RP Hub
            </Link>
            <div className="flex items-center space-x-4">
                <Link href="/story" className="flex flex-col items-center p-2 rounded-lg hover:bg-white/10 transition-colors"><span className="text-2xl">📖</span><span className="text-xs text-gray-400">Story</span></Link>
                <Link href="/wiki/The_Dominion" className="flex flex-col items-center p-2 rounded-lg hover:bg-white/10 transition-colors"><span className="text-2xl">🗺️</span><span className="text-xs text-gray-400">World</span></Link>
                <Link href="/guild" className="flex flex-col items-center p-2 rounded-lg hover:bg-white/10 transition-colors"><span className="text-2xl">🏛️</span><span className="text-xs text-gray-400">Guild</span></Link>
                <Link href="/directory" className="flex flex-col items-center p-2 rounded-lg hover:bg-white/10 transition-colors"><span className="text-2xl">👥</span><span className="text-xs text-gray-400">Directory</span></Link>
                <Link href="/narratives" className="flex flex-col items-center p-2 rounded-lg hover:bg-white/10 transition-colors"><span className="text-2xl">📚</span><span className="text-xs text-gray-400">Library</span></Link>
            </div>
            <div className="flex items-center space-x-4">
                {user ? (
                <>
                    <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition-colors">
                    Logout
                    </button>
                    <button onClick={() => setIsUserCpOpen(true)} title="Your Account" className="relative text-2xl p-2 rounded-full hover:bg-white/10 transition-colors">
                    👤
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-800"></span>
                    </button>
                </>
                ) : (
                <div className="space-x-4">
                    <Link href="/login" className="text-sm font-medium text-white hover:text-purple-400 transition-colors">Login</Link>
                    <Link href="/register" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors">Register</Link>
                </div>
                )}
            </div>
            </nav>
        </header>

        {/* --- THE SLIDE-OUT PANEL (Corrected Layout) --- */}
        <div 
            className={`fixed inset-0 h-full w-full z-50 transition-opacity duration-300 ease-in-out ${
                isUserCpOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        >
            <div 
                onClick={() => setIsUserCpOpen(false)} 
                className="absolute inset-0 bg-black/60"
            />
            
            <div 
                className={`absolute top-0 right-0 h-full w-80 bg-gray-900 shadow-2xl p-6 border-l border-gray-700 transition-transform duration-300 ease-in-out ${
                    isUserCpOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Welcome, {user?.username}!</h2>
                    <button onClick={() => setIsUserCpOpen(false)} className="text-2xl text-gray-400 hover:text-white">&times;</button>
                </div>
                
                {/* This is the main container for the panel's content */}
                <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
                    <div>
                        {/* Placeholder for future notifications */}
                        <div className="border-b border-gray-700 pb-4">
                            <p className="text-gray-400 text-sm">Notification previews will go here.</p>
                        </div>

                        <nav className="pt-4 space-y-2">
                            <Link href="/account/settings" onClick={() => setIsUserCpOpen(false)} className="flex items-center gap-4 p-3 rounded-md hover:bg-purple-500/10 text-white">
                                <span className="text-xl">⚙️</span>
                                <span>Account Settings</span>
                            </Link>
                            <Link href="/account/characters" onClick={() => setIsUserCpOpen(false)} className="flex items-center gap-4 p-3 rounded-md hover:bg-purple-500/10 text-white">
                                <span className="text-xl">⚔️</span>
                                <span>My Characters</span>
                            </Link>
                            <Link href="/account/narratives" onClick={() => setIsUserCpOpen(false)} className="flex items-center gap-4 p-3 rounded-md hover:bg-purple-500/10 text-white">
                                <span className="text-xl">📜</span>
                                <span>My Narratives</span>
                            </Link>
                            <Link href="/account/friends" onClick={() => setIsUserCpOpen(false)} className="flex items-center gap-4 p-3 rounded-md hover:bg-purple-500/10 text-white">
                                <span className="text-xl">🤝</span>
                                <span>Friends List</span>
                            </Link>
                        </nav>
                    </div>

                    {/* Button to create a new character */}
                    <div className="pb-4">
                        <Link href="/account/characters/new" onClick={() => setIsUserCpOpen(false)} className="block w-full text-center p-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold">
                            + Create a New Character
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
