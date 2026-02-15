import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import {
    HiOutlineUser, HiOutlineBell, HiOutlineShieldCheck,
    HiOutlineKey, HiOutlineGlobe, HiOutlineMoon, HiOutlineSun,
    HiOutlineDesktopComputer, HiOutlineDownload, HiOutlineTrash,
    HiOutlinePhotograph
} from 'react-icons/hi';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const { theme: currentTheme, setTheme } = useTheme();
    const [activeSection, setActiveSection] = useState('account');
    const [saving, setSaving] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        channelName: user?.channelName || '',
        bio: user?.bio || '',
        email: user?.email || '',
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [preferences, setPreferences] = useState({
        theme: currentTheme,
        language: 'en',
        autoplay: true,
        notifications: true,
        emailNotifications: false,
        restrictedMode: false,
    });

    const sections = [
        { id: 'account', label: 'Account', icon: HiOutlineUser },
        { id: 'password', label: 'Password', icon: HiOutlineKey },
        { id: 'notifications', label: 'Notifications', icon: HiOutlineBell },
        { id: 'appearance', label: 'Appearance', icon: HiOutlineMoon },
        { id: 'privacy', label: 'Privacy & Security', icon: HiOutlineShieldCheck },
        { id: 'advanced', label: 'Advanced', icon: HiOutlineDesktopComputer },
    ];

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const formData = new FormData();
            Object.entries(profileForm).forEach(([k, v]) => formData.append(k, v));
            const avatarInput = document.getElementById('settings-avatar');
            if (avatarInput?.files[0]) formData.append('avatar', avatarInput.files[0]);
            const bannerInput = document.getElementById('settings-banner');
            if (bannerInput?.files[0]) formData.append('banner', bannerInput.files[0]);

            const { data } = await authAPI.updateProfile(formData);
            updateUser(data.user);
            toast.success('Profile updated!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    const ToggleSwitch = ({ checked, onChange, label, desc }) => (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-sm font-medium text-z-text">{label}</p>
                {desc && <p className="text-xs text-z-text-muted mt-0.5">{desc}</p>}
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-brand' : 'bg-z-surface-hover'
                    }`}
            >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'
                    }`} />
            </button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="md:w-56 shrink-0">
                    <nav className="space-y-0.5">
                        {sections.map(sec => (
                            <button
                                key={sec.id}
                                onClick={() => setActiveSection(sec.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${activeSection === sec.id
                                        ? 'bg-z-surface text-z-text'
                                        : 'text-z-text-secondary hover:bg-z-surface hover:text-z-text'
                                    }`}
                            >
                                <sec.icon className="w-5 h-5" />
                                {sec.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Account */}
                    {activeSection === 'account' && (
                        <div className="card-elevated p-6 animate-fade-in">
                            <h2 className="text-lg font-bold mb-6">Account Information</h2>
                            <form onSubmit={handleSaveProfile} className="space-y-5">
                                {/* Avatar */}
                                <div className="flex items-center gap-4">
                                    <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=9147ff&color=fff&size=200`}
                                        alt="" className="avatar avatar-2xl" />
                                    <div className="space-y-2">
                                        <label className="btn-secondary text-sm cursor-pointer inline-flex items-center gap-2">
                                            <HiOutlinePhotograph className="w-4 h-4" /> Change avatar
                                            <input type="file" accept="image/*" className="hidden" id="settings-avatar" />
                                        </label>
                                        <p className="text-xs text-z-text-muted">Recommended: 200x200 PNG or JPG</p>
                                    </div>
                                </div>

                                {/* Banner */}
                                <div>
                                    <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Channel banner</label>
                                    <label className="flex items-center justify-center py-8 border-2 border-dashed border-z-border
                    rounded-xl cursor-pointer hover:border-brand/40 hover:bg-brand/5 transition-all">
                                        <div className="text-center">
                                            <HiOutlinePhotograph className="w-8 h-8 text-z-text-muted mx-auto mb-1" />
                                            <p className="text-xs text-z-text-muted">Upload banner (2048x1152)</p>
                                        </div>
                                        <input type="file" accept="image/*" className="hidden" id="settings-banner" />
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Display name</label>
                                        <input type="text" value={profileForm.name}
                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                            className="input-field" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Channel name</label>
                                        <input type="text" value={profileForm.channelName}
                                            onChange={(e) => setProfileForm({ ...profileForm, channelName: e.target.value })}
                                            className="input-field" placeholder="@yourhandle" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Email</label>
                                    <input type="email" value={profileForm.email} disabled
                                        className="input-field opacity-60 cursor-not-allowed" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Bio</label>
                                    <textarea value={profileForm.bio}
                                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                        className="input-field h-24 resize-none" maxLength={500}
                                        placeholder="Tell viewers about yourself" />
                                    <p className="text-xs text-z-text-muted mt-1">{profileForm.bio.length}/500</p>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button type="submit" disabled={saving} className="btn-primary">
                                        {saving ? 'Saving...' : 'Save changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Password */}
                    {activeSection === 'password' && (
                        <div className="card-elevated p-6 animate-fade-in">
                            <h2 className="text-lg font-bold mb-6">Change Password</h2>
                            <form className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Current password</label>
                                    <input type="password" value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-z-text-secondary mb-1.5">New password</label>
                                    <input type="password" value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Confirm new password</label>
                                    <input type="password" value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className="input-field" />
                                </div>
                                <button type="submit" className="btn-primary">Update password</button>
                            </form>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeSection === 'notifications' && (
                        <div className="card-elevated p-6 animate-fade-in">
                            <h2 className="text-lg font-bold mb-6">Notification Preferences</h2>
                            <div className="divide-y divide-z-border">
                                <ToggleSwitch checked={preferences.notifications} label="Push notifications"
                                    desc="Get notified about new uploads and activity"
                                    onChange={(v) => setPreferences({ ...preferences, notifications: v })} />
                                <ToggleSwitch checked={preferences.emailNotifications} label="Email notifications"
                                    desc="Receive email updates about your channel"
                                    onChange={(v) => setPreferences({ ...preferences, emailNotifications: v })} />
                                <ToggleSwitch checked={true} label="Subscription updates"
                                    desc="Notify when subscribed channels upload" onChange={() => { }} />
                                <ToggleSwitch checked={true} label="Comment replies"
                                    desc="Notify when someone replies to your comment" onChange={() => { }} />
                                <ToggleSwitch checked={false} label="Promotional emails"
                                    desc="Updates about Zentube features and offers" onChange={() => { }} />
                            </div>
                        </div>
                    )}

                    {/* Appearance */}
                    {activeSection === 'appearance' && (
                        <div className="card-elevated p-6 animate-fade-in">
                            <h2 className="text-lg font-bold mb-6">Appearance</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-z-text mb-3">Theme</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'dark', label: 'Dark', icon: HiOutlineMoon, desc: 'Always dark' },
                                            { id: 'light', label: 'Light', icon: HiOutlineSun, desc: 'Always light' },
                                            { id: 'system', label: 'System', icon: HiOutlineDesktopComputer, desc: 'Match device' },
                                        ].map(theme => (
                                            <button
                                                key={theme.id}
                                                onClick={() => { setPreferences({ ...preferences, theme: theme.id }); setTheme(theme.id); }}
                                                className={`p-4 rounded-xl border transition-all text-center ${preferences.theme === theme.id
                                                    ? 'border-brand bg-brand/10 shadow-glow'
                                                    : 'border-z-border hover:border-z-border-light hover:bg-z-surface'
                                                    }`}
                                            >
                                                <theme.icon className="w-6 h-6 mx-auto mb-2" />
                                                <p className="text-sm font-medium">{theme.label}</p>
                                                <p className="text-xs text-z-text-muted mt-0.5">{theme.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="divider" />

                                <ToggleSwitch checked={preferences.autoplay} label="Autoplay videos"
                                    desc="Automatically play the next video"
                                    onChange={(v) => setPreferences({ ...preferences, autoplay: v })} />
                            </div>
                        </div>
                    )}

                    {/* Privacy */}
                    {activeSection === 'privacy' && (
                        <div className="card-elevated p-6 animate-fade-in">
                            <h2 className="text-lg font-bold mb-6">Privacy & Security</h2>
                            <div className="divide-y divide-z-border">
                                <ToggleSwitch checked={preferences.restrictedMode} label="Restricted Mode"
                                    desc="Hide potentially mature content"
                                    onChange={(v) => setPreferences({ ...preferences, restrictedMode: v })} />
                                <ToggleSwitch checked={true} label="Keep watch history"
                                    desc="Save your watch history for better recommendations" onChange={() => { }} />
                                <ToggleSwitch checked={true} label="Keep search history"
                                    desc="Save your search history" onChange={() => { }} />
                            </div>
                            <div className="mt-6 pt-4 border-t border-z-border">
                                <h3 className="text-sm font-medium mb-3">Data Management</h3>
                                <div className="flex flex-wrap gap-3">
                                    <button className="btn-secondary text-sm flex items-center gap-2">
                                        <HiOutlineDownload className="w-4 h-4" /> Download your data
                                    </button>
                                    <button className="btn-danger text-sm flex items-center gap-2">
                                        <HiOutlineTrash className="w-4 h-4" /> Delete account
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Advanced */}
                    {activeSection === 'advanced' && (
                        <div className="card-elevated p-6 animate-fade-in">
                            <h2 className="text-lg font-bold mb-6">Advanced Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Language</label>
                                    <select value={preferences.language}
                                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                                        className="input-field max-w-xs">
                                        <option value="en">English</option>
                                        <option value="es">Español</option>
                                        <option value="fr">Français</option>
                                        <option value="de">Deutsch</option>
                                        <option value="ja">日本語</option>
                                        <option value="ko">한국어</option>
                                        <option value="hi">हिन्दी</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-z-text-secondary mb-1.5">Country</label>
                                    <select className="input-field max-w-xs">
                                        <option>India</option>
                                        <option>United States</option>
                                        <option>United Kingdom</option>
                                        <option>Canada</option>
                                        <option>Australia</option>
                                    </select>
                                </div>
                                <div className="divider" />
                                <div>
                                    <h3 className="text-sm font-medium mb-2">Developer</h3>
                                    <p className="text-xs text-z-text-muted mb-2">User ID: {user?._id}</p>
                                    <button className="btn-ghost text-xs">Copy API Token</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
