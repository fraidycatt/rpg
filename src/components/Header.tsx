'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  // Check this line for a semicolon at the end
  const { user, logout } = useAuth();

  // Make sure you have the opening parenthesis for the return
  return (
    <header className="bg-gray-800/30 backdrop-blur-sm p-4 sticky top-0 z-50">
      <nav className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white hover:text-purple-400 transition-colors">
          RP Hub
        </Link>
        <div className="flex items-center space-x-6">
          {/* Main Navigation Links */}
          <Link href="/story" className="text-gray-300 hover:text-white transition-colors">
            Story
          </Link>
          <Link href="/wiki/The_Dominion" className="text-gray-300 hover:text-white transition-colors">
            World
          </Link>
          <Link href="/friends" className="text-gray-300 hover:text-white transition-colors">
            Friends
          </Link>
        {user && (
    <Link href="/account/narratives" className="text-gray-300 hover:text-white transition-colors">
      Narratives
    </Link>
  )}
  <Link href="/narratives">Library</Link>
          {/* This is the new, dynamic part */}
          <div className="pl-6 border-l border-gray-700">
            {user ? (
              // If the 'user' object exists, show this:
              <div className="flex items-center space-x-4">
                <span className="text-white">Welcome, {user.username}!</span>
                <button 
                  onClick={logout} 
                  className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded-md text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              // If 'user' is null, show this:
              <div className="space-x-4">
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/register" className="text-gray-300 hover:text-white transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
// Make sure this final closing brace for the function is there
}