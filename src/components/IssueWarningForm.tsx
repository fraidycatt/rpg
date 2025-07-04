'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function IssueWarningForm() {
    const { token } = useAuth();
    const [userIdToWarn, setUserIdToWarn] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            const res = await fetch('/api/v1/admin/warnings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    userIdToWarn: parseInt(userIdToWarn, 10), 
                    reason 
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to issue warning.');
            }

            setSuccessMessage(`Warning successfully issued to user ID: ${userIdToWarn}`);
            // Clear the form on success
            setUserIdToWarn('');
            setReason('');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Issue a Warning</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="userIdToWarn" className="block text-sm font-medium text-gray-300">
                        User ID to Warn
                    </label>
                    <input
                        id="userIdToWarn"
                        type="number"
                        value={userIdToWarn}
                        onChange={(e) => setUserIdToWarn(e.target.value)}
                        required
                        className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md"
                    />
                </div>
                <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-300">
                        Reason for Warning
                    </label>
                    <textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        rows={4}
                        className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md disabled:bg-gray-500 font-medium"
                >
                    {isLoading ? 'Submitting...' : 'Submit Warning'}
                </button>
            </form>
            {successMessage && <p className="mt-4 text-green-400">{successMessage}</p>}
            {error && <p className="mt-4 text-red-500">{error}</p>}
        </div>
    );
}