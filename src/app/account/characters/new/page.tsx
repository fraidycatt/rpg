'use client';

import CharacterForm from '@/components/CharacterForm'; // Import our new reusable form
import { useAuth } from '@/context/AuthContext';

export default function CreateCharacterPage() {
    const { user } = useAuth();

    // The initial data for a brand new character is an empty object
    const initialCharacterData = {
        character_name: '',
        character_class: '',
        rp_status: 1, // Default to "Open to All"
        gender: 1,    // Default to "Male"
        appearance: '',
        personality: '',
        history: '',
    };

    if (!user) {
        return <p className="p-24 text-white">You must be logged in to create a character.</p>;
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
            <div className="w-full max-w-2xl bg-gray-800/50 p-8 rounded-lg shadow-2xl border border-gray-700">
                <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">Create a New Character</h1>
                
                {/* We render our reusable form here.
                  - We tell it `isCreating={true}` so it shows the "Create" button.
                  - We pass the initial blank data to it.
                */}
                <CharacterForm 
                    isCreating={true} 
                    initialData={initialCharacterData} 
                />
            </div>
        </main>
    );
}