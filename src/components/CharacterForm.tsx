'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Define the shape of the character data
interface CharacterData {
    character_name: string;
    character_class: string;
    rp_status: number;
    gender: number;
    appearance: string;
    personality: string;
    history: string;
}

// The form will receive props to handle both creating and editing
interface CharacterFormProps {
    initialData?: Partial<CharacterData>; // Optional: for pre-filling the form in edit mode
    characterId?: number; // Optional: for knowing which character to update
    isCreating: boolean; // To change button text and API endpoint
}

export default function CharacterForm({ initialData, characterId, isCreating }: CharacterFormProps) {
    const { token } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState<Partial<CharacterData>>(initialData || {});
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // This handler updates the state for any input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const url = isCreating ? 'http://localhost:3001/api/v1/characters' : `http://localhost:3001/api/v1/characters/${characterId}`;
        const method = isCreating ? 'POST' : 'PATCH';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Something went wrong.');

            // On success, redirect to the character's profile page
            const newOrUpdatedId = data.id || data.character.id;
            router.push(`/characters/${newOrUpdatedId}`);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-gray-800/50 p-8 rounded-lg">
            <div>
                <label htmlFor="character_name" className="block text-sm font-medium">Character Name</label>
                <input type="text" name="character_name" value={formData.character_name || ''} onChange={handleInputChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md" required />
            </div>

            <div>
                <label htmlFor="character_class" className="block text-sm font-medium">Class / Concept</label>
                <input type="text" name="character_class" value={formData.character_class || ''} onChange={handleInputChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md" placeholder="e.g., Rogue, Noble, Starship Captain" required />
            </div>

            <div>
                <label htmlFor="rp_status" className="block text-sm font-medium">RP Status</label>
                <select name="rp_status" value={formData.rp_status || ''} onChange={handleInputChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md">
                    <option value={1}>Open to All</option>
                    <option value={2}>Ask First</option>
                    <option value={3}>Friends Only</option>
                    <option value={4}>Closed</option>
                </select>
            </div>

            <div>
                <label htmlFor="gender" className="block text-sm font-medium">Gender</label>
                <select name="gender" value={formData.gender || ''} onChange={handleInputChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md">
                    <option value={1}>Male</option>
                    <option value={2}>Female</option>
                    <option value={3}>Non-binary</option>
                </select>
            </div>

            <div>
                <label htmlFor="appearance" className="block text-sm font-medium">Appearance</label>
                <textarea name="appearance" value={formData.appearance || ''} onChange={handleInputChange} rows={5} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md" />
            </div>

            <div>
                <label htmlFor="personality" className="block text-sm font-medium">Personality</label>
                <textarea name="personality" value={formData.personality || ''} onChange={handleInputChange} rows={5} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md" />
            </div>

            <div>
                <label htmlFor="history" className="block text-sm font-medium">History</label>
                <textarea name="history" value={formData.history || ''} onChange={handleInputChange} rows={8} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md" />
            </div>

            <div>
                <button type="submit" disabled={isSubmitting} className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-md disabled:bg-gray-500">
                    {isCreating ? (isSubmitting ? 'Creating...' : 'Create Character') : (isSubmitting ? 'Saving...' : 'Save Changes')}
                </button>
            </div>
            {error && <p className="text-red-400 text-center">{error}</p>}
        </form>
    );
}