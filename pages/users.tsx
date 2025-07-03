import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/users.module.scss';

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

  if (loading) return <div className={styles.loadingScreen}>Loading...</div>;
  if (error) return <div className={styles.errorScreen}>{error}</div>;

  return (
    <div className={styles.directoryPage}>
      <div className={styles.backgroundOverlay}></div>

      <div className={styles.container}>
        <div className={styles.backButtonWrapper}>
          <Link href="/dashboard" className={styles.backButton}>
            ← Back to Dashboard
          </Link>
        </div>

        <div className={styles.directoryCard}>
          <h1 className={styles.title}>User Directory</h1>

          {users.length === 0 ? (
            <div className={styles.emptyMessage}>No users found.</div>
          ) : (
            <ul className={styles.userList}>
              {users.map(user => (
                <li key={user.email} className={styles.userCard}>
                  <div className={styles.userName}>{user.name}</div>
                  <div className={styles.userEmail}>{user.email}</div>

                  {user.repos.length === 0 ? (
                    <div className={styles.noRepos}>No public repositories</div>
                  ) : (
                    <ul className={styles.repoList}>
                      {user.repos.map((repo: any) => (
                        <li key={repo.id} className={styles.repoItem}>
                          <Link href={`/public/${repo.id}`} className={styles.repoLink}>
                            {repo.name}
                          </Link>
                          <span className={styles.repoDesc}>{repo.description}</span>
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
