import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import styles from '../styles/profile.module.scss';

export default function Profile() {
  const { status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState({ name: '', email: '', description: '', profilePic: '' });
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user/me');
      const data = await res.json();
      if (res.ok) {
        setProfile({
          name: data.name || '',
          email: data.email || '',
          description: data.description || '',
          profilePic: data.profilePic || '',
        });
      } else {
        setError(data.message || 'Failed to fetch profile');
      }
    } catch (err) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicFile(e.target.files[0]);
      setProfile(p => ({ ...p, profilePic: URL.createObjectURL(e.target.files![0]) }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    let profilePicUrl = profile.profilePic;
    if (profilePicFile) {
      const formData = new FormData();
      formData.append('profilePic', profilePicFile);
      const res = await fetch('/api/user/upload-profile-pic', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        profilePicUrl = data.url;
      } else {
        setError(data.message || 'Failed to upload profile picture');
        setSaving(false);
        return;
      }
    }
    const res = await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: profile.name,
        description: profile.description,
        profilePic: profilePicUrl,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess('Profile updated!');
      setProfilePicFile(null);
    } else {
      setError(data.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.profilePage}>
      <div className={styles.card}>
        <h1 className={styles.title}>My Profile</h1>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        <form onSubmit={handleSave}>
          <div className={styles.avatarContainer}>
            <label htmlFor="profilePicInput" className={styles.avatarLabel}>
              {profile.profilePic ? (
                <img
                  src={profile.profilePic}
                  alt="Profile Preview"
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>Add Photo</div>
              )}
            </label>
            <input
              id="profilePicInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleProfilePicChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={profile.email}
              readOnly
              disabled
              className={styles.readOnly}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={profile.description}
              onChange={e => setProfile(p => ({ ...p, description: e.target.value }))}
              rows={3}
            />
          </div>

          <button type="submit" className={styles.saveButton} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
