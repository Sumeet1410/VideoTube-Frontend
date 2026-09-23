import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateAccount, changePassword, updateAvatar, updateCoverImage } from '../api';
import Avatar from '../components/UI/Avatar';
import Button from '../components/UI/Button';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';
import { HiUser, HiLockClosed, HiPhotograph } from 'react-icons/hi';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Image states
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Both fields are required');
      return;
    }
    setProfileLoading(true);
    try {
      const { data } = await updateAccount({ fullName: fullName.trim(), email: email.trim() });
      updateUser(data?.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update profile'));
    }
    setProfileLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword.trim() || !newPassword.trim()) {
      toast.error('Both fields are required');
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword({ oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      toast.success('Password changed');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to change password'));
    }
    setPasswordLoading(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await updateAvatar(fd);
      updateUser(data?.data);
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update avatar'));
    }
    setAvatarLoading(false);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverLoading(true);
    try {
      const fd = new FormData();
      fd.append('coverImage', file);
      const { data } = await updateCoverImage(fd);
      updateUser(data?.data);
      toast.success('Cover image updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update cover image'));
    }
    setCoverLoading(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <HiUser size={18} /> },
    { id: 'password', label: 'Password', icon: <HiLockClosed size={18} /> },
    { id: 'images', label: 'Images', icon: <HiPhotograph size={18} /> },
  ];

  return (
    <div className="settings-page" id="settings-page">
      <h1 className="page-title">Settings</h1>

      <div className="settings-layout">
        {/* Tabs */}
        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content glass animate-fade-in">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="settings-form">
              <h2 className="settings-section-title">Profile Information</h2>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" variant="primary" loading={profileLoading}>Save Changes</Button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="settings-form">
              <h2 className="settings-section-title">Change Password</h2>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <Button type="submit" variant="primary" loading={passwordLoading}>Update Password</Button>
            </form>
          )}

          {activeTab === 'images' && (
            <div className="settings-form">
              <h2 className="settings-section-title">Profile Images</h2>

              <div className="image-upload-section">
                <div className="image-upload-card">
                  <h3>Avatar</h3>
                  <Avatar src={user?.avatar} name={user?.fullName} size={80} />
                  <label className="file-input-label" style={{ marginTop: 'var(--space-md)' }}>
                    {avatarLoading ? 'Uploading...' : 'Change Avatar'}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
                  </label>
                </div>

                <div className="image-upload-card">
                  <h3>Cover Image</h3>
                  <div className="cover-preview">
                    {user?.coverImage ? (
                      <img src={user.coverImage} alt="Cover" />
                    ) : (
                      <div className="cover-placeholder">No cover image</div>
                    )}
                  </div>
                  <label className="file-input-label" style={{ marginTop: 'var(--space-md)' }}>
                    {coverLoading ? 'Uploading...' : 'Change Cover'}
                    <input type="file" accept="image/*" onChange={handleCoverUpload} hidden />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
