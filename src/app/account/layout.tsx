// src/app/account/layout.tsx

'use client'; // This must be a client component to use navigation hooks

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Used to detect the active tab
import { ReactNode } from 'react';

// Define the navigation links for the User CP
const accountNavLinks = [
    { name: 'Settings', href: '/account/settings' },
    { name: 'Characters', href: '/account/characters' },
    { name: 'Narratives', href: '/account/narratives' },
    { name: 'Friends', href: '/account/friends' },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname(); // Gets the current URL path

    return (
        <main className="flex min-h-screen flex-col items-center p-8 sm:p-12 bg-gray-900 text-white">
            <div className="w-full max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-yellow-300">Your Account</h1>
                    <p className="text-gray-400 mt-1">Manage your profile, characters, and stories.</p>
                </div>

                {/* --- Tab Navigation --- */}
                <nav className="flex space-x-4 border-b border-gray-700 mb-8">
                    {accountNavLinks.map((link) => {
                        const isActive = pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`py-2 px-4 font-medium transition-colors ${
                                    isActive
                                        ? 'border-b-2 border-purple-400 text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* --- Page Content --- */}
                {/* The 'children' prop will be the actual page (Settings, Characters, etc.) */}
                <div>
                    {children}
                </div>
            </div>
        </main>
    );
}