import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/explore.module.scss';

interface Repo {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  ownerName?: string;
}

interface User {
  name: string;
  email: string;
  repos: Repo[];
}

const ExplorePage = () => {
  const router = useRouter();
  const { query } = router.query;
  const [users, setUsers] = useState<User[]>([]);
  const [repoResults, setRepoResults] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || typeof query !== 'string') {
      setUsers([]);
      setRepoResults([]);
      return;
    }

    setLoading(true);

    fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
      });

    fetch(`/api/repos/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        setRepoResults(data.repositories || []);
      })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className={styles.explorePage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Explore</h1>

        {query ? (
          <>
            <p className={styles.queryText}>
              Showing results for: <strong>{query}</strong>
            </p>

            {loading && <div className={styles.loading}>Loading...</div>}

            {!loading && (
              <>
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>Users</h2>
                  {users.length === 0 ? (
                    <p className={styles.emptyState}>No users found.</p>
                  ) : (
                    <ul className={styles.cardList}>
                      {users.map(user => (
                        <li key={user.email} className={styles.card}>
                          <div className={styles.userHeader}>
                            <strong className={styles.userName}>{user.name}</strong>
                            <span className={styles.userEmail}>({user.email})</span>
                          </div>

                          {user.repos.length > 0 ? (
                            <ul className={styles.repoList}>
                              {user.repos.map(repo => (
                                <li key={repo.id} className={styles.repoItem}>
                                  <Link href={`/public/${repo.id}`} className={styles.repoLink}>
                                    {repo.name}
                                  </Link>
                                  {repo.description && (
                                    <span className={styles.repoDesc}>: {repo.description}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className={styles.emptyRepos}>No public repositories</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>Repositories</h2>
                  {repoResults.length === 0 ? (
                    <p className={styles.emptyState}>No repositories found.</p>
                  ) : (
                    <ul className={styles.cardList}>
                      {repoResults.map(repo => (
                        <li key={repo.id} className={styles.card}>
                          <Link href={`/public/${repo.id}`} className={styles.repoLink}>
                            <strong>{repo.name}</strong>
                          </Link>
                          <span className={styles.repoMeta}>
                            {' '} (Owner: {repo.ownerName})
                          </span>
                          {repo.description && (
                            <p className={styles.repoDesc}>{repo.description}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </>
            )}
          </>
        ) : (
          <p className={styles.emptyState}>Type a search query in the navbar above.</p>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
