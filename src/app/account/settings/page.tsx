'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface UserProfile {
    availability: number | null;
    timezone: string;
    pronouns: string;
    bio: string;
    is_directory_listed: boolean;
}

const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
];

export default function AccountSettingsPage() {
    const { user, token, logout } = useAuth();
    const router = useRouter();
    
    // --- FIX #1: Initialize the profile state with default, non-undefined values ---
    const [profile, setProfile] = useState<Partial<UserProfile>>({
        availability: 0,
        timezone: '',
        pronouns: '',
        bio: '',
        is_directory_listed: false,
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
    
    // Restore the state for the password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [newEmail, setNewEmail] = useState('');
    const [passwordForEmail, setPasswordForEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Fetch the user's current profile data
    useEffect(() => {
        if (user?.username && token) {
            const fetchProfile = async () => {
                setIsLoading(true);
                try {
                    const res = await fetch(`http://localhost:3001/api/v1/profiles/${user.username}`);
                    if (!res.ok) throw new Error('Failed to fetch profile data.');
                    const data = await res.json();
                    
                    // Set the state with the fetched data, providing fallbacks for any null values
                    setProfile({
                        availability: data.user.availability || 0,
                        timezone: data.user.timezone || '',
                        pronouns: data.user.pronouns || '',
                        bio: data.user.bio || '',
                        is_directory_listed: data.user.is_directory_listed || false,
                    });
                } catch (err: any) {
                    setProfileError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProfile();
        } else if (token === null || token === undefined) {
             setIsLoading(false);
        }
    }, [user, token]);

    // A single, consistent handler for all profile form inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const newValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;
        
        setProfile(prevProfile => ({
            ...prevProfile,
            [name]: name === 'availability' ? parseInt(value, 10) : newValue,
        }));
    };

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError(null);
        setProfileSuccess(null);
        try {
            const res = await fetch('http://localhost:3001/api/v1/profiles/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(profile),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to update profile.');
            }
            setProfile(data.user);
            setProfileSuccess('Your profile settings have been saved!');
        } catch (err: any) {
            setProfileError(err.message);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }
        try {
            const res = await fetch('http://localhost:3001/api/auth/change-password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to change password.');
            setPasswordSuccess(data.message);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setPasswordError(err.message);
        }
    };

    const handleEmailChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError(null);
        setEmailSuccess(null);

        try {
            const res = await fetch('http://localhost:3001/api/auth/change-email', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ newEmail, currentPassword: passwordForEmail }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to change email.');
            }

            setEmailSuccess(data.message);
            setNewEmail('');
            setPasswordForEmail('');

        } catch (err: any) {
            setEmailError(err.message);
        }
    };

        const handleDeleteAccount = async () => {
        setDeleteError(null);
        if (!window.confirm('ARE YOU ABSOLUTELY SURE? This action cannot be undone and will permanently delete your account and all associated characters.')) {
            return;
        }
        try {
            const res = await fetch('http://localhost:3001/api/auth/me', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ password: deletePassword }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete account.');
            }
            alert('Your account has been deleted.');
            logout();
            router.push('/');

        } catch (err: any) {
            setDeleteError(err.message);
        }
    };

    if (isLoading) return <p className="p-24 text-white animate-pulse">Loading your settings...</p>;
    if (!user) return <p className="p-24 text-red-400">Please log in to view your settings.</p>;

    return (
        <main className="flex justify-center p-8 sm:p-12 bg-gray-900 text-white min-h-screen">
            <div className="w-full max-w-2xl space-y-12">
                <div>
                    <h1 className="text-3xl font-bold mb-6 text-purple-400">Profile Settings</h1>
                    <form onSubmit={handleProfileSave} className="space-y-8 bg-gray-800/50 p-8 rounded-lg">
                        
                        <div>
                            <label htmlFor="availability" className="block text-sm font-medium">Your Posting Availability</label>
                            <select id="availability" name="availability" value={profile.availability || ''} onChange={handleInputChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md">
                                <option value="" disabled>-- Select --</option>
                                <option value={1}>Daily</option>
                                <option value={2}>A Few Times a Week</option>
                                <option value={3}>Weekly</option>
                                <option value={4}>Sporadic</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="timezone" className="block text-sm font-medium">Timezone</label>
                            <select id="timezone" name="timezone" value={profile.timezone || ''} onChange={handleInputChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md">
                                <option value="">-- Select --</option>
                                {timezones.map(tz => (<option key={tz.value} value={tz.value}>{tz.label}</option>))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="pronouns" className="block text-sm font-medium">Pronouns</label>
                            <input type="text" id="pronouns" name="pronouns" value={profile.pronouns || ''} onChange={handleInputChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md" placeholder="e.g., she/her, they/them" />
                        </div>

                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium">About Me (OOC)</label>
                            <textarea id="bio" name="bio" value={profile.bio || ''} onChange={handleInputChange} rows={4} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md" placeholder="Tell us a little about yourself as a player..." />
                        </div>

                        {/* --- THIS IS FIX #3: The Corrected Toggle JSX --- */}
                        <div className="border-t border-b border-gray-700 py-6">
                            <label htmlFor="is_directory_listed" className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input type="checkbox" id="is_directory_listed" name="is_directory_listed" className="sr-only peer" checked={!!profile.is_directory_listed} onChange={handleInputChange} />
                                    <div className="block bg-gray-600 w-14 h-8 rounded-full peer-checked:bg-purple-600"></div>
                                    <div className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out transform peer-checked:translate-x-full"></div>
                                </div>
                                <div className="ml-3 text-gray-200">
                                    <span className="font-medium">Include me in the Player Directory</span>
                                    <p className="text-xs text-gray-400">Allow other players to find you and your characters.</p>
                                </div>
                            </label>
                        </div>
                        
                        <div>
                            <button type="submit" className="py-2 px-6 bg-purple-600 hover:bg-purple-700 rounded-md">Save Profile</button>
                        </div>
                        {profileError && <p className="text-red-400 mt-4">{profileError}</p>}
                        {profileSuccess && <p className="text-green-400 mt-4">{profileSuccess}</p>}
                    </form>
                </div>
                
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-purple-400">Change Email</h2>
                    <form onSubmit={handleEmailChange} className="space-y-6 bg-gray-800/50 p-8 rounded-lg">
                        <div>
                            <label htmlFor="newEmail">New Email Address</label>
                            <input
                                type="email"
                                id="newEmail"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="passwordForEmail">Confirm with Current Password</label>
                            <input
                                type="password"
                                id="passwordForEmail"
                                value={passwordForEmail}
                                onChange={(e) => setPasswordForEmail(e.target.value)}
                                className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <button type="submit" className="py-2 px-6 bg-purple-600 hover:bg-purple-700 rounded-md">
                                Update Email
                            </button>
                        </div>
                        {emailError && <p className="text-red-400 mt-4">{emailError}</p>}
                        {emailSuccess && <p className="text-green-400 mt-4">{emailSuccess}</p>}
                    </form>
                </div>

                {/* Your working password form is restored */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-purple-400">Change Password</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-6 bg-gray-800/50 p-8 rounded-lg">
                        <div>
                            <label htmlFor="currentPassword">Current Password</label>
                            <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="newPassword">New Password</label>
                            <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md" required />
                        </div>
                        <div>
                            <button type="submit" className="py-2 px-6 bg-purple-600 hover:bg-purple-700 rounded-md">Update Password</button>
                        </div>
                        {passwordError && <p className="text-red-400 mt-4">{passwordError}</p>}
                        {passwordSuccess && <p className="text-green-400 mt-4">{passwordSuccess}</p>}
                    </form>
                </div>
                <div className="border-t-2 border-red-500/30 pt-8">
                    <h2 className="text-2xl font-bold mb-6 text-red-400">Danger Zone</h2>
                    <div className="space-y-6 bg-red-900/20 p-8 rounded-lg border border-red-500/30">
                        <h3 className="text-lg font-semibold">Delete Account</h3>
                        <p className="text-sm text-red-200">This action is permanent and cannot be undone. All of your characters, posts, and narratives will be permanently deleted.</p>
                        <div className="space-y-2">
                            <label htmlFor="deletePassword">To confirm, please enter your password:</label>
                            <input
                                type="password"
                                id="deletePassword"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md px-3 py-2"
                                required
                            />
                        </div>
                        <button type="button" onClick={handleDeleteAccount} className="w-full py-2 px-6 bg-red-600 hover:bg-red-700 rounded-md font-bold">
                            Permanently Delete My Account
                        </button>
                        {deleteError && <p className="text-yellow-300 mt-4">{deleteError}</p>}
                    </div>
                </div>
            </div>
        </main>
    );
}