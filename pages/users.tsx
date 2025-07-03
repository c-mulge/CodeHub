import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UsersDirectory() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto p-4">
        <div className="mb-4">
          <Link href="/dashboard" className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">← Back to Dashboard</Link>
        </div>
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-2 sm:p-6 rounded shadow overflow-x-auto">
          <h1 className="text-2xl font-bold mb-6">User Directory</h1>
          {users.length === 0 ? (
            <div>No users found.</div>
          ) : (
            <ul>
              {users.map(user => (
                <li key={user.email} className="mb-6">
                  <div className="font-semibold text-lg">{user.name}</div>
                  <div className="text-xs text-gray-500 mb-2">{user.email}</div>
                  {user.repos.length === 0 ? (
                    <div className="text-gray-400 text-sm">No public repositories</div>
                  ) : (
                    <ul className="ml-4 mt-1">
                      {user.repos.map((repo: any) => (
                        <li key={repo.id} className="mb-1">
                          <Link href={`/public/${repo.id}`} className="text-blue-600 hover:underline font-medium">
                            {repo.name}
                          </Link>
                          <span className="ml-2 text-xs text-gray-600">{repo.description}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 