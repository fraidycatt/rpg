'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Icon from '@/components/Icon';


// The NavLink now uses the <Icon> component
const NavLink = ({ href, iconName, text }: { href: string; iconName: string; text: string }) => (
    <Link 
      href={href} 
      className="group relative flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors w-full"
      title={text} // Add a tooltip for accessibility
    >
        <Icon 
            name={iconName} 
            className="w-14 h-14 text-gray-300 group-hover:text-white transition-all duration-300 
                    shadow-red-500/70 /* Or any color you like */
                       group-hover:drop-shadow-[0_4px_6px_rgba(0,0,0,0.50)]" 
        />
        <span className="text-xs text-gray-400 group-hover:text-purple-400 transition-colors">
            {text}
        </span>
    </Link>
);

// A specific component for the links inside the new panel
const PanelLink = ({ href, icon, text, onClick }: { href: string; icon: string; text: string; onClick: () => void }) => (
     <Link href={href} onClick={onClick} className="flex items-center gap-4 p-3 rounded-md hover:bg-purple-500/10 text-white transition-colors">
        <span className="text-xl">{icon}</span>
        <span>{text}</span>
    </Link>
);

export default function Sidebar() {
    const { user, logout } = useAuth();
    const [isUserCpOpen, setIsUserCpOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Effect to lock body scroll when either panel is open
    useEffect(() => {
        if (isUserCpOpen || isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isUserCpOpen, isMobileMenuOpen]);

    return (
        <>
            {/* Mobile Hamburger Menu Button (Unchanged) */}
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-gray-800/50 backdrop-blur-sm rounded-md"
                aria-label="Open navigation"
            >
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* --- Main Minimal Sidebar --- */}
            <aside 
                className={`fixed top-0 right-0 h-screen w-24 bg-transparent z-40
                            flex flex-col items-center justify-between py-6 transition-transform duration-300 ease-in-out
                            ${isMobileMenuOpen ? 'translate-x-0 bg-gray-900/80 backdrop-blur-md' : 'translate-x-full md:translate-x-0'}`}
            >
                {/* --- Top Section: User CP --- */}
                <div className="w-full px-2">
                    {user && (
                        <button onClick={() => setIsUserCpOpen(true)} title="Your Account" className="relative w-full flex items-center justify-center text-2xl p-2 rounded-full hover:bg-white/10 transition-colors">
                            <Icon name="King" className="w-12 h-12" />
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-900"></span>
                        </button>
                    )}
                </div>
                
                {/* This empty div helps push the nav to the center */}
                <div></div>

               <nav className="flex flex-col items-center w-full px-2">
    <NavLink href="/story" iconName="Castle" text="Story" />
                    <NavLink href="/wiki/The_Dominion" iconName="Dragon" text="World" />
                    <NavLink href="/guild" iconName="Shield_Pikes" text="Guild" />
                    <NavLink href="/directory" iconName="Compass" text="Directory" />
                    <NavLink href="/narratives" iconName="Spellbook" text="Library" />
</nav>

<div className="flex flex-col items-center space-y-2 w-full px-2">
                    {user ? (
                        <div title="Logout" className="w-full">
                            <button onClick={logout} className="group relative flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors w-full">
                                {/* Replace the emoji with your new Icon component */}
                                <Icon name="Shooting_Star" className="w-12 h-12 text-gray-400 group-hover:text-white transition-colors" />
                                <span className="text-xs text-gray-400 group-hover:text-white">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <NavLink href="/login" iconName="login" text="Login" />
                    )}
                    
                     <div className="w-full">
                        <div className="group relative flex flex-col items-center justify-center p-2 rounded-lg w-full">
                            <Icon name="Elf" className="w-12 h-12" />
                            <span className="text-xs text-gray-500">Chat</span>
                        </div>
                    </div>
                </div>
            </aside>
            
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="md:hidden fixed inset-0 bg-black/50 z-30"
                />
            )}


            {/* --- NEW: The Wider User CP Slide-Out Panel --- */}
            <div className={`fixed inset-0 h-full w-full z-50 transition-opacity duration-300 ease-in-out ${isUserCpOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Background Overlay */}
                <div onClick={() => setIsUserCpOpen(false)} className="absolute inset-0 bg-black/60"/>
                
                {/* The Panel Itself */}
                <div className={`absolute top-0 right-0 h-full w-80 bg-gray-900 shadow-2xl p-6 border-l border-gray-700 transition-transform duration-300 ease-in-out ${isUserCpOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Welcome, {user?.username}!</h2>
                        <button onClick={() => setIsUserCpOpen(false)} className="text-2xl text-gray-400 hover:text-white">&times;</button>
                    </div>
                    
                    <div className="flex flex-col h-[calc(100%-4rem)]">
                        {/* --- This is where the notification preview will go --- */}
                        <div className="border-b border-gray-700 pb-4">
                             <h3 className="text-base font-semibold text-purple-300 mb-2">Notifications</h3>
                             <div className="text-center text-gray-500 text-sm py-8">
                                <p>No new notifications.</p>
                             </div>
                        </div>

                        {/* --- Main Account Links --- */}
                        <nav className="flex-grow pt-4 space-y-2">
                            <PanelLink href="/account/settings" icon="⚙️" text="Account Settings" onClick={() => setIsUserCpOpen(false)} />
                            <PanelLink href="/account/characters" icon="⚔️" text="My Characters" onClick={() => setIsUserCpOpen(false)} />
                            <PanelLink href="/account/narratives" icon="📜" text="My Narratives" onClick={() => setIsUserCpOpen(false)} />
                            <PanelLink href="/account/friends" icon="🤝" text="Friends List" onClick={() => setIsUserCpOpen(false)} />
                        </nav>
                    </div>
                </div>
            </div>

        </>
    );
}
