'use client';

import { useAuth } from '@/context/AuthContext';
import IssueWarningForm from '@/components/IssueWarningForm';

export default function AdminDashboardPage() {
    const { user } = useAuth();

    // A simple check to show a loading state or a message if the user is not an admin.
    if (!user || user.role !== 'admin') {
        return (
            <main className="flex justify-center p-8 sm:p-12 bg-gray-900 text-white min-h-screen">
                <p>You do not have permission to view this page.</p>
            </main>
        );
    }

    return (
        <main className="flex justify-center p-8 sm:p-12 bg-gray-900 text-white min-h-screen">
            <div className="w-full max-w-4xl space-y-8">
                <div>
                    <h1 className="text-4xl font-bold">Admin Control Panel</h1>
                    <p className="text-gray-400 mt-1">Welcome, {user.username}.</p>
                </div>

                {/* We will render our first admin tool here */}
                <IssueWarningForm />

            </div>
        </main>
    );
}