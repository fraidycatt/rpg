// src/components/directory/UserDirectory.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// Helper function to translate the availability code into text
const getAvailabilityText = (code: string | null) => {
    // We convert the code to a number for the switch statement
    const numericCode = code ? parseInt(code, 10) : null;
    switch (numericCode) {
        case 1: return 'Daily';
        case 2: return 'Weekly';
        case 3: return 'Bi-Weekly';
        case 4: return 'Monthly';
        default: return 'Not Set';
    }
};

// Define the shape of a user in the directory
interface DirectoryUser {
    id: number;
    username: string;
    availability: string;
    timezone: string;
    pronouns: string;
    about_me: string; // Using about_me to match your backend
}

export default function UserDirectory() {
    const [users, setUsers] = useState<DirectoryUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- The filters state is back in! ---
    const [filters, setFilters] = useState({
        availability: '',
        timezone: ''
    });

    // This function fetches the users based on the current filters
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Build the query string from our filters object
            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`http://localhost:3001/api/v1/directory/users?${query}`);
            
            if (!res.ok) throw new Error('Failed to fetch user directory.');

            const data = await res.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [filters]); // Re-run the fetch whenever the filters change

    // Initial fetch when the component loads
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // This handler for the filters is also back.
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6">
            {/* --- The Filter UI is back! --- */}
            <div className="bg-gray-800/50 p-4 rounded-lg flex gap-4 items-end">
                <div>
                    <label htmlFor="availability" className="block text-sm font-medium text-gray-300">Availability</label>
                    {/* The value for these options should be the number code your DB uses */}
                    <select name="availability" value={filters.availability} onChange={handleFilterChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md">
                        <option value="">Any</option>
                        <option value="1">Daily</option>
                        <option value="2">Weekly</option>
                        <option value="3">Bi-Weekly</option>
                        <option value="4">Monthly</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-300">Timezone</label>
                    <select name="timezone" value={filters.timezone} onChange={handleFilterChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md">
                        <option value="">Any</option>
                        <option value="PST">PST</option>
                        <option value="MST">MST</option>
                        <option value="CST">CST</option>
                        <option value="EST">EST</option>
                    </select>
                </div>
            </div>

            {/* --- Results Display --- */}
            {isLoading && <p>Loading players...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.length > 0 ? users.map(user => (
                        <Link key={user.id} href={`/users/${user.username}`} className="block bg-gray-800 p-4 rounded-lg hover:bg-gray-700/70 transition-colors">
                            <h3 className="text-xl font-bold text-white">{user.username}</h3>
                            <p className="text-sm text-purple-400">{user.pronouns || 'No pronouns set'}</p>
                            <div className="text-xs text-gray-400 mt-2 space-y-1">
                                {/* --- The text is now translated correctly! --- */}
                                <p><strong>Available:</strong> {getAvailabilityText(user.availability)}</p>
                                <p><strong>Timezone:</strong> {user.timezone || 'Not set'}</p>
                            </div>
                        </Link>
                    )) : (
                        <p className="text-gray-500 md:col-span-3 text-center">No players match the current filters.</p>
                    )}
                </div>
            )}
        </div>
    );
}