import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { userService } from '../../services/user';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Settings, Shield, Bell } from 'lucide-react';

export const SettingsPage = () => {
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: "New passwords don't match" });
            return;
        }

        setSaving(true);
        try {
            await userService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setMessage({ type: 'success', text: 'Password updated successfully' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            const msg = error.response?.data?.error || "Failed to update password";
            setMessage({ type: 'error', text: msg });
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-3 bg-purple-600/20 rounded-xl text-purple-400">
                            <Settings className="h-8 w-8" />
                        </div>
                        Settings
                    </h1>
                    <p className="text-gray-400 mt-2">Manage your app preferences and security</p>
                </header>

                <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                    {/* Security Section */}
                    <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">Security</h3>
                                <p className="text-sm text-gray-500">Manage your password and authentication</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                            {message && (
                                <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
                                    {message.text}
                                </div>
                            )}

                            <Input
                                type="password"
                                label="Current Password"
                                value={passwordForm.currentPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                required
                            />
                            <Input
                                type="password"
                                label="New Password"
                                value={passwordForm.newPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                required
                                minLength={6}
                            />
                            <Input
                                type="password"
                                label="Confirm New Password"
                                value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                required
                            />

                            <div className="pt-2">
                                <Button type="submit" isLoading={saving}>
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* App Info Section */}
                    <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                                <Bell className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">Application Info</h3>
                                <p className="text-sm text-gray-500">About Finexo</p>
                            </div>
                        </div>

                        <div className="text-gray-400 text-sm space-y-2">
                            <p>Version: <span className="text-white">1.0.0 (Beta)</span></p>
                            <p>Environment: <span className="text-white">Development</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
