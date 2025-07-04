// src/components/directory/CharacterDirectory.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// Define the shape of a character in the directory
interface DirectoryCharacter {
    id: number;
    character_name: string;
    character_class: string;
    rp_status: number;
    owner_username: string;
}

// --- NEW: Interface for a genre/story beat ---
interface Genre {
    id: number;
    name: string;
}

export default function CharacterDirectory() {
    const [characters, setCharacters] = useState<DirectoryCharacter[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

   // --- FIX: Add 'genre' to our filters state ---
    const [filters, setFilters] = useState({
        rp_status: '',
        gender: '',
        genre: ''
    });

    // This function fetches characters based on the current filters
    const fetchCharacters = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const FiltersWithValues = Object.fromEntries(
                Object.entries(filters).filter(([, value]) => value !== '')
            );
            const query = new URLSearchParams(FiltersWithValues).toString();
            const res = await fetch(`http://localhost:3001/api/v1/directory/characters?${query}`);
            
            if (!res.ok) throw new Error('Failed to fetch characters.');

            const data = await res.json();
            setCharacters(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    // This useEffect runs only once to get the list of genres for the dropdown
    useEffect(() => {
        const getGenres = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/v1/genres');
                const data = await res.json();
                setGenres(data);
            } catch (err) {
                console.error("Failed to fetch genres", err);
            }
        };
        getGenres();
    }, []);

    // This useEffect re-fetches characters whenever the filters change
    useEffect(() => {
        fetchCharacters();
    }, [fetchCharacters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6">
            {/* --- Filter UI --- */}
            <div className="bg-gray-800/50 p-4 rounded-lg flex gap-4 items-end">
                <div>
                    <label htmlFor="rp_status" className="block text-sm font-medium text-gray-300">RP Status</label>
                    <select name="rp_status" value={filters.rp_status} onChange={handleFilterChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md">
                        <option value="">Any</option>
                        <option value="1">Open to All</option>
                        <option value="2">Ask First</option>
                        <option value="3">Friends Only</option>
                        <option value="4">Closed</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-300">Gender</label>
                    <select name="gender" value={filters.gender} onChange={handleFilterChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md">
                        <option value="">Any</option>
                        <option value="1">Male</option>
                        <option value="2">Female</option>
                        <option value="3">Non-binary</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-300">Genre</label>
                    <select name="genre" value={filters.genre} onChange={handleFilterChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md">
                        <option value="">Any</option>
                        {/* The dropdown is now populated from our new API endpoint */}
                        {genres.map(genre => (
                            <option key={genre.id} value={genre.id}>{genre.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- Results Display --- */}
            {isLoading && <p>Loading characters...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {characters.length > 0 ? characters.map(char => (
                        <Link key={char.id} href={`/characters/${char.id}`} className="block bg-gray-800 p-4 rounded-lg hover:bg-gray-700/70 transition-colors">
                            <h3 className="text-xl font-bold text-white">{char.character_name}</h3>
                            <p className="text-sm text-purple-400">{char.character_class}</p>
                            <p className="text-xs text-gray-400 mt-2">Played by {char.owner_username}</p>
                        </Link>
                    )) : (
                        <p className="text-gray-500 md:col-span-3 text-center">No characters match the current filters.</p>
                    )}
                </div>
            )}
        </div>
    );
}