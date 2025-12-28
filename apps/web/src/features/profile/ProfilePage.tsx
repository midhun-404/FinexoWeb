import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { userService, type UserProfile } from '../../services/user';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Calendar } from 'lucide-react';

export const ProfilePage = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [form, setForm] = useState({
        country: '',
        currencyCode: '',
        currencySymbol: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await userService.getMe();
            setProfile(data);
            setForm({
                country: data.country,
                currencyCode: data.currencyCode,
                currencySymbol: data.currencySymbol
            });
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const updated = await userService.updateProfile(form);
            setProfile(updated);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <DashboardLayout><div className="text-white">Loading...</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-3 bg-purple-600/20 rounded-xl text-purple-400">
                            <User className="h-8 w-8" />
                        </div>
                        My Profile
                    </h1>
                    <p className="text-gray-400 mt-2">Manage your account information</p>
                </header>

                <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
                    {/* ID Card */}
                    <div className="md:col-span-1">
                        <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-6 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4">
                                {profile?.email.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-xl font-bold text-white truncate px-2">{profile?.email.split('@')[0]}</h2>
                            <p className="text-sm text-gray-500 mt-1 truncate px-2">{profile?.email}</p>

                            <div className="mt-6 flex flex-col gap-3 text-left">
                                <div className="flex items-center gap-3 text-sm text-gray-400 bg-[#111] p-3 rounded-lg">
                                    <Calendar className="h-4 w-4 text-purple-400" />
                                    <span>Joined {new Date(profile?.createdAt || '').getFullYear()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div className="md:col-span-2">
                        <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-6">
                            <h3 className="text-xl font-semibold text-white mb-6">Personal Details</h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {message && (
                                    <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
                                        {message.text}
                                    </div>
                                )}

                                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                                    <Input
                                        label="Country"
                                        value={form.country}
                                        onChange={e => setForm({ ...form, country: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                                    <Input
                                        label="Currency Code"
                                        value={form.currencyCode}
                                        onChange={e => setForm({ ...form, currencyCode: e.target.value })}
                                        required
                                        maxLength={3}
                                    />
                                    <Input
                                        label="Currency Symbol"
                                        value={form.currencySymbol}
                                        onChange={e => setForm({ ...form, currencySymbol: e.target.value })}
                                        required
                                        maxLength={5}
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-800 flex justify-end">
                                    <Button type="submit" isLoading={saving}>
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
