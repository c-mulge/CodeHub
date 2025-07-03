import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

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
    // Fetch users matching the query
    fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
      });
    // Fetch repositories matching the query using the new endpoint
    fetch(`/api/repos/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        setRepoResults(data.repositories || []);
      })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Explore</h1>
      {query ? (
        <>
          <p>Showing results for: <strong>{query}</strong></p>
          {loading && <p>Loading...</p>}
          {!loading && (
            <>
              <h2>Users</h2>
              {users.length === 0 && <p>No users found.</p>}
              <ul>
                {users.map(user => (
                  <li key={user.email} style={{ marginBottom: '1rem' }}>
                    <strong>{user.name}</strong> ({user.email})
                    {user.repos.length > 0 && (
                      <ul>
                        {user.repos.map(repo => (
                          <li key={repo.id}><strong>{repo.name}</strong>: {repo.description}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              <h2>Repositories</h2>
              {repoResults.length === 0 && <p>No repositories found.</p>}
              <ul>
                {repoResults.map(repo => (
                  <li key={repo.id}><strong>{repo.name}</strong> (Owner: {repo.ownerName}){repo.description ? `: ${repo.description}` : ''}</li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <p>Type a search query in the navbar above.</p>
      )}
    </div>
  );
};

export default ExplorePage; 