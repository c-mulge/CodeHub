import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Profile() {
  const { status } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

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
        setName(data.name);
        setEmail(data.email);
      } else {
        setError(data.message || 'Failed to fetch profile');
      }
    } catch (err) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password: password || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Profile updated successfully!');
        setPassword('');
      } else {
        setError(data.message || 'Update failed');
      }
    } catch (err) {
      setError('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-2 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded shadow">
        <div className="mb-4">
          <Link href="/dashboard" className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">← Back to Dashboard</Link>
        </div>
        <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        {success && <div className="mb-2 text-green-600">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1" htmlFor="name">Name</label>
            <input
              className="w-full border px-3 py-2 rounded"
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1" htmlFor="email">Email</label>
            <input
              className="w-full border px-3 py-2 rounded bg-gray-100"
              type="email"
              id="email"
              value={email}
              readOnly
              disabled
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1" htmlFor="password">New Password (optional)</label>
            <input
              className="w-full border px-3 py-2 rounded"
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </div>
          <button
            className="w-full bg-blue-600 text-white py-2 rounded"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
} 